import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

const REGION_MAP: Record<string, { platform: string, cluster: string }> = {
  "BR": { platform: "br1", cluster: "americas" },
  "NA": { platform: "na1", cluster: "americas" },
  "EUW": { platform: "euw1", cluster: "europe" },
  "EUNE": { platform: "eun1", cluster: "europe" },
  "KR": { platform: "kr", cluster: "asia" },
  "LAN": { platform: "la1", cluster: "americas" },
  "LAS": { platform: "la2", cluster: "americas" },
};

export const syncPlayerStats = action({
  args: { playerId: v.id("scoutedPlayers") },
  handler: async (ctx, args) => {
    if (!RIOT_API_KEY || RIOT_API_KEY === "RGAPI-your-key-here") {
      console.warn("Riot API Key not configured");
      return;
    }

    const player = await ctx.runQuery(api.scouting.getPlayerById, { id: args.playerId });
    if (!player) return;

    const regionInfo = REGION_MAP[player.region.toUpperCase()] || REGION_MAP["BR"];
    const { platform, cluster } = regionInfo;

    try {
      // 1. Get PUUID by Riot ID (name + tagline)
      const accountRes = await fetch(
        `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(player.name)}/${encodeURIComponent(player.tagline)}?api_key=${RIOT_API_KEY}`
      );
      if (!accountRes.ok) {
        console.error(`Account fetch failed: ${accountRes.status} ${accountRes.statusText}`);
        return;
      }
      const account = await accountRes.json();
      const puuid = account.puuid;

      // 2. Get Summoner Data by PUUID (for level/icon if needed, but we mainly care about PUUID now)
      const summonerRes = await fetch(
        `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`
      );
      if (!summonerRes.ok) {
        console.error(`Summoner fetch failed: ${summonerRes.status}`);
        return;
      }
      const summoner = await summonerRes.json();
      // Note: Summoner ID is deprecated in Riot ID migration, we prioritize PUUID

      // 3. Get Ranked Stats by PUUID
      // Most modern regions now support /lol/league/v4/entries/by-puuid/{puuid}
      const leagueRes = await fetch(
        `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`
      );
      
      let leagueData = await leagueRes.json();
      
      let soloQ = null;
      if (Array.isArray(leagueData)) {
        soloQ = leagueData.find((entry: any) => entry.queueType === "RANKED_SOLO_5x5");
      } else {
        console.warn(`League data by PUUID lookup for ${puuid} on ${platform}:`, leagueData);
      }

      // 4. Get Match History (last 20 matches)
      const matchesListRes = await fetch(
        `https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${RIOT_API_KEY}&queue=420`
      );
      if (!matchesListRes.ok) {
        console.error(`Match list fetch failed: ${matchesListRes.status} for PUUID ${puuid}`);
        return;
      }
      const matchIds = await matchesListRes.json();

      if (!Array.isArray(matchIds)) {
        console.warn("Match IDs is not an array:", matchIds);
        return;
      }

      // 5. Filter out already synced matches
      const existingMatchIds = new Set((player.matches || []).map((m: any) => m.matchId));
      const newMatchIds = matchIds.filter(id => !existingMatchIds.has(id));

      // 6. Get Batch Match Details for NEW matches only
      const newMatchesResults = await Promise.all(
        newMatchIds.map(async (matchId: string) => {
          try {
            // Fetch match detail and timeline in parallel
            const [mRes, tRes] = await Promise.all([
              fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${RIOT_API_KEY}`),
              fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline?api_key=${RIOT_API_KEY}`)
            ]);

            if (!mRes.ok) return null;
            
            const mData = await mRes.json();
            if (!mData?.info?.participants) return null;

            const participants = mData.info.participants;
            const playerParticipant = participants.find((p: any) => p.puuid === puuid);
            if (!playerParticipant) return null;

            // Process Timeline for Multi-Interval Snapshots
            const snapshots: Record<string, any> = {};
            if (tRes.ok) {
              const tData = await tRes.json();
              const frames = tData.info.frames;
              const participantId = tData.info.participants.find((p: any) => p.puuid === puuid)?.participantId;
              const myPosition = playerParticipant.individualPosition;
              const opponent = participants.find((p: any) => p.teamId !== playerParticipant.teamId && p.individualPosition === myPosition);
              const opponentParticipantId = opponent?.participantId;

              if (participantId !== undefined) {
                // Pre-process events for objectives
                const objectiveHistory = { dragon: 0, baron: 0 };
                const eventMap: Record<number, any> = {};
                
                [10, 15, 20].forEach((minute) => {
                  const frameIndex = Math.min(minute, frames.length - 1);
                  if (frameIndex >= 0) {
                    const playerFrame = frames[frameIndex].participantFrames[participantId];
                    const opponentFrame = opponentParticipantId ? frames[frameIndex].participantFrames[opponentParticipantId] : null;
                    
                    // Sum objectives up to this frame
                    let dragCount = 0;
                    let baronCount = 0;
                    for (let i = 0; i <= frameIndex; i++) {
                       const events = frames[i].events || [];
                       events.forEach((ev: any) => {
                          if (ev.type === "ELITE_MONSTER_KILL" && ev.killerTeamId === playerParticipant.teamId) {
                             if (ev.monsterType === "DRAGON") dragCount++;
                             if (ev.monsterType === "BARON_NASHOR") baronCount++;
                          }
                       });
                    }

                    if (playerFrame) {
                      snapshots[`${minute}m`] = {
                        gold: playerFrame.totalGold,
                        cs: playerFrame.minionsKilled + playerFrame.jungleMinionsKilled,
                        xp: playerFrame.xp,
                        level: playerFrame.level,
                        // Leads
                        goldLead: opponentFrame ? playerFrame.totalGold - opponentFrame.totalGold : 0,
                        csLead: opponentFrame ? (playerFrame.minionsKilled + playerFrame.jungleMinionsKilled) - (opponentFrame.minionsKilled + opponentFrame.jungleMinionsKilled) : 0,
                        xpLead: opponentFrame ? playerFrame.xp - opponentFrame.xp : 0,
                        // Context
                        objectives: { dragon: dragCount, baron: baronCount },
                        opponentHero: opponent?.championName
                      };
                    }
                  }
                });
              }
            }

            const playerTeamId = playerParticipant.teamId;
            const myTeam = participants.filter((p: any) => p.teamId === playerTeamId);
            const enemyTeam = participants.filter((p: any) => p.teamId !== playerTeamId);

            // Calculate Team Totals
            const teamTotalDamage = myTeam.reduce((sum: number, p: any) => sum + p.totalDamageDealtToChampions, 0);
            const teamTotalGold = myTeam.reduce((sum: number, p: any) => sum + p.goldEarned, 0);
            const teamTotalDamageTaken = myTeam.reduce((sum: number, p: any) => sum + p.totalDamageTaken, 0);
            
            const gameDurationMinutes = mData.info.gameDuration / 60;

            // Simplified Composition for UI
            const extractComp = (team: any[]) => team.map((p: any) => ({
              championId: p.championId,
              championName: p.championName,
              summonerName: p.summonerName,
              riotIdGameName: p.riotIdGameName,
              riotIdTagline: p.riotIdTagline,
              kills: p.kills,
              deaths: p.deaths,
              assists: p.assists,
              individualPosition: p.individualPosition,
              puuid: p.puuid,
              totalDamageDealtToChampions: p.totalDamageDealtToChampions,
              goldEarned: p.goldEarned,
            }));

            // Extract Challenges & Advanced Stats
            const challenges = playerParticipant.challenges || {};
            
            return {
              matchId,
              win: playerParticipant.win,
              championId: playerParticipant.championId,
              championName: playerParticipant.championName,
              kills: playerParticipant.kills,
              deaths: playerParticipant.deaths,
              assists: playerParticipant.assists,
              kda: ((playerParticipant.kills + playerParticipant.assists) / Math.max(1, playerParticipant.deaths)).toFixed(2),
              position: playerParticipant.teamPosition,
              items: [
                playerParticipant.item0, playerParticipant.item1, playerParticipant.item2, 
                playerParticipant.item3, playerParticipant.item4, playerParticipant.item5, 
                playerParticipant.item6
              ],
              summoner1Id: playerParticipant.summoner1Id,
              summoner2Id: playerParticipant.summoner2Id,
              primaryRune: playerParticipant.perks?.styles?.[0]?.selections?.[0]?.perk,
              secondaryStyle: playerParticipant.perks?.styles?.[1]?.style,
              
              // Advanced Performance
              dpm: challenges.damagePerMinute || (playerParticipant.totalDamageDealtToChampions / Math.max(1, gameDurationMinutes)),
              cspm: challenges.gameLength > 0 ? (playerParticipant.totalMinionsKilled + playerParticipant.neutralMinionsKilled) / (challenges.gameLength / 60) : (playerParticipant.totalMinionsKilled + playerParticipant.neutralMinionsKilled) / Math.max(1, gameDurationMinutes),
              goldShare: teamTotalGold > 0 ? (playerParticipant.goldEarned / teamTotalGold) * 100 : 0,
              damageShare: teamTotalDamage > 0 ? (playerParticipant.totalDamageDealtToChampions / teamTotalDamage) * 100 : 0,
              kp: challenges.killParticipation ? (challenges.killParticipation * 100) : 0,
              
              // Tankiness & Resistance
              totalDamageTaken: playerParticipant.totalDamageTaken,
              damageSelfMitigated: playerParticipant.damageSelfMitigated,
              damageTakenShare: teamTotalDamageTaken > 0 ? (playerParticipant.totalDamageTaken / teamTotalDamageTaken) * 100 : 0,

              // Snapshots (10m, 15m, 20m)
              snapshots,
              
              // Detailed Stats
              goldEarned: playerParticipant.goldEarned,
              totalDamageDealtToChampions: playerParticipant.totalDamageDealtToChampions,
              physicalDamageDealtToChampions: playerParticipant.physicalDamageDealtToChampions,
              magicDamageDealtToChampions: playerParticipant.magicDamageDealtToChampions,
              trueDamageDealtToChampions: playerParticipant.trueDamageDealtToChampions,
              totalMinionsKilled: playerParticipant.totalMinionsKilled,
              neutralMinionsKilled: playerParticipant.neutralMinionsKilled,
              visionScore: playerParticipant.visionScore,
              
              // Team/Match Context
              gameMode: mData.info.gameMode,
              gameDuration: mData.info.gameDuration,
              gameEndTimestamp: mData.info.gameEndTimestamp,
              
              // Compositions
              myTeam: extractComp(myTeam),
              enemyTeam: extractComp(enemyTeam),
              
              // Objectives (Current team)
              teamObjectives: mData.info.teams.find((t: any) => t.teamId === playerTeamId)?.objectives || {},
              turretPlatesDestroyed: challenges.turretPlatesTaken || 0,
            };
          } catch (e) {
            console.error(`Error fetching match ${matchId}:`, e);
            return null;
          }
        })
      );

      const validNewMatches = newMatchesResults.filter((m): m is Exclude<typeof m, null> => m !== null);
      
      // 7. Merge and sort
      const allMatches = [...validNewMatches, ...(player.matches || [])]
        .filter((v, i, a) => a.findIndex(t => t.matchId === v.matchId) === i) // Final safety dedupe
        .sort((a, b) => b.gameEndTimestamp - a.gameEndTimestamp)
        .slice(0, 40); // Keep last 40 games for analysis

      const recentWinRate = allMatches.length > 0 
        ? Math.round((allMatches.filter(m => m.win).length / allMatches.length) * 100)
        : 0;

      // Save to database
      await ctx.runMutation(api.scouting.updatePlayerData, {
        id: args.playerId,
        puuid,
        rank: soloQ?.tier || "UNRANKED",
        tier: soloQ?.rank,
        lp: soloQ?.leaguePoints || 0,
        winRate: recentWinRate,
        games: (soloQ?.wins || 0) + (soloQ?.losses || 0),
        matches: allMatches,
      });

    } catch (error) {
      console.error("Error syncing Riot data:", error);
    }
  },
});
