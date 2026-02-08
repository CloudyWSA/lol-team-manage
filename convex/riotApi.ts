import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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

// --- REUSABLE HELPERS ---

async function fetchRiot(url: string) {
  const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}api_key=${RIOT_API_KEY}`);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Riot API Error: ${res.status} ${res.statusText} - ${errorText}`);
  }
  return res.json();
}

function getRegionInfo(regionStr?: string) {
  return REGION_MAP[regionStr?.toUpperCase() || ""] || REGION_MAP["BR"];
}

async function getMatchDetails(matchId: string, cluster: string) {
  const mData = await fetchRiot(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/${matchId}`);
  let tData = null;
  try {
    tData = await fetchRiot(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline`);
  } catch (e) {
    console.warn(`Timeline not available for match ${matchId}`);
  }
  return { mData, tData };
}

function parseParticipant(p: any, gameDurationMinutes: number) {
  const challenges = p.challenges || {};
  return {
    puuid: p.puuid,
    summonerName: `${p.riotIdGameName}#${p.riotIdTagline}`,
    championName: p.championName,
    role: p.individualPosition || p.teamPosition,
    teamId: p.teamId,
    kills: p.kills,
    deaths: p.deaths,
    assists: p.assists,
    win: p.win,
    totalDamageDealtToChampions: p.totalDamageDealtToChampions,
    goldEarned: p.goldEarned,
    // Add more details if needed for analysis
    cs: p.totalMinionsKilled + p.neutralMinionsKilled,
    dpm: challenges.damagePerMinute || (p.totalDamageDealtToChampions / Math.max(1, gameDurationMinutes)),
    visionScore: p.visionScore,
    items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6],
  };
}

// --- ACTIONS ---

export const syncPlayerStats = action({
  args: { playerId: v.id("scoutedPlayers") },
  handler: async (ctx, args) => {
    if (!RIOT_API_KEY) return;

    const player = await ctx.runQuery(api.scouting.getPlayerById, { id: args.playerId });
    if (!player) return;

    const { platform, cluster } = getRegionInfo(player.region);

    try {
      // 1. Get PUUID by Riot ID
      const account = await fetchRiot(
        `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(player.name)}/${encodeURIComponent(player.tagline)}`
      );
      const puuid = account.puuid;

      // 2. Get Ranked Stats
      const leagueData = await fetchRiot(`https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`);
      const soloQ = Array.isArray(leagueData) ? leagueData.find((entry: any) => entry.queueType === "RANKED_SOLO_5x5") : null;

      // 3. Get Match History
      const matchIds = await fetchRiot(
        `https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&queue=420`
      );

      const existingMatchIds = new Set((player.matches || []).map((m: any) => m.matchId));
      const newMatchIds = matchIds.filter((id: string) => !existingMatchIds.has(id));

      const newMatchesResults = await Promise.all(
        newMatchIds.map(async (matchId: string) => {
          try {
            const { mData, tData } = await getMatchDetails(matchId, cluster);
            const participants = mData.info.participants;
            const playerParticipant = participants.find((p: any) => p.puuid === puuid);
            if (!playerParticipant) return null;

            const gameDurationMinutes = mData.info.gameDuration / 60;
            const snapshots: Record<string, any> = {};

            if (tData) {
              const frames = tData.info.frames;
              const participantId = tData.info.participants.find((p: any) => p.puuid === puuid)?.participantId;
              const myPosition = playerParticipant.individualPosition;
              const opponent = participants.find((p: any) => p.teamId !== playerParticipant.teamId && p.individualPosition === myPosition);
              const opponentParticipantId = opponent?.participantId;

              if (participantId !== undefined) {
                [10, 15, 20].forEach((minute) => {
                  const frameIndex = Math.min(minute, frames.length - 1);
                  if (frameIndex >= 0) {
                    const playerFrame = frames[frameIndex].participantFrames[participantId];
                    const opponentFrame = opponentParticipantId ? frames[frameIndex].participantFrames[opponentParticipantId] : null;

                    if (playerFrame) {
                      snapshots[`${minute}m`] = {
                        gold: playerFrame.totalGold,
                        cs: playerFrame.minionsKilled + playerFrame.jungleMinionsKilled,
                        xp: playerFrame.xp,
                        level: playerFrame.level,
                        goldLead: opponentFrame ? playerFrame.totalGold - opponentFrame.totalGold : 0,
                        csLead: opponentFrame ? (playerFrame.minionsKilled + playerFrame.jungleMinionsKilled) - (opponentFrame.minionsKilled + opponentFrame.jungleMinionsKilled) : 0,
                        xpLead: opponentFrame ? playerFrame.xp - opponentFrame.xp : 0,
                      };
                    }
                  }
                });
              }
            }

            return {
              ...parseParticipant(playerParticipant, gameDurationMinutes),
              matchId,
              snapshots,
              gameDuration: mData.info.gameDuration,
              gameEndTimestamp: mData.info.gameEndTimestamp,
            };
          } catch (e) {
            return null;
          }
        })
      );

      const validNewMatches = newMatchesResults.filter((m): m is any => m !== null);
      const allMatches = [...validNewMatches, ...(player.matches || [])]
        .filter((v, i, a) => a.findIndex(t => t.matchId === v.matchId) === i)
        .sort((a, b) => b.gameEndTimestamp - a.gameEndTimestamp)
        .slice(0, 40);

      const recentWinRate = allMatches.length > 0
        ? Math.round((allMatches.filter(m => m.win).length / allMatches.length) * 100)
        : 0;

      await ctx.runMutation(api.scouting.updatePlayerData, {
        id: args.playerId,
        puuid,
        summonerId: player.summonerId || "", // Keep existing or empty
        rank: soloQ?.tier || "UNRANKED",
        tier: soloQ?.rank || "",
        lp: soloQ?.leaguePoints || 0,
        winRate: recentWinRate,
        games: allMatches.length,
        matches: allMatches,
      });

    } catch (e) {
      console.error(`Sync failed for player ${player.name}:`, e);
    }
  },
});

export const syncScrimGame = action({
  args: {
    scrimId: v.id("scrims"),
    matchId: v.string(),
    gameNumber: v.number(),
    region: v.string(),
  },
  handler: async (ctx, args) => {
    if (!RIOT_API_KEY) throw new Error("API Key missing");

    const { cluster } = getRegionInfo(args.region);

    try {
      const { mData } = await getMatchDetails(args.matchId, cluster);
      const participants = mData.info.participants;
      const gameDurationMinutes = mData.info.gameDuration / 60;

      const parsedParticipants = participants.map((p: any) => parseParticipant(p, gameDurationMinutes));

      const getTeamStats = (teamId: number) => {
        const teamParts = participants.filter((p: any) => p.teamId === teamId);
        const teamObj = mData.info.teams.find((t: any) => t.teamId === teamId);
        return {
          gold: teamParts.reduce((sum: number, p: any) => sum + p.goldEarned, 0),
          kills: teamParts.reduce((sum: number, p: any) => sum + p.kills, 0),
          towers: teamObj?.objectives?.tower?.kills || 0,
          dragons: teamObj?.objectives?.dragon?.kills || 0,
          barons: teamObj?.objectives?.baron?.kills || 0,
          grubs: teamObj?.objectives?.horde?.kills || 0,
        };
      };

      const blueStats = getTeamStats(100);
      const redStats = getTeamStats(200);

      const blueTeamWon = participants.find((p: any) => p.teamId === 100)?.win;

      await ctx.runMutation(api.scrims.addDetailedGame, {
        scrimId: args.scrimId,
        gameNumber: args.gameNumber,
        riotMatchId: args.matchId,
        duration: `${Math.floor(gameDurationMinutes)}:${Math.round((gameDurationMinutes % 1) * 60).toString().padStart(2, "0")}`,
        result: blueTeamWon ? "W" : "L",
        side: "Blue",
        participants: parsedParticipants,
        blueStats,
        redStats,
      });

      return { success: true };
    } catch (e) {
      console.error("Match Sync Failed:", e);
      throw new Error("Falha ao sincronizar dados da partida.");
    }
  },
});

export const registerTeamMatch = action({
  args: {
    teamId: v.id("scoutingTeams"),
    matchId: v.string(),
    tournament: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!RIOT_API_KEY) throw new Error("API Key missing");

    const team = await ctx.runQuery(api.scouting.getTeamById, { id: args.teamId });
    if (!team) throw new Error("Team not found");

    const players = await ctx.runQuery(api.scouting.getPlayersByTeam, { teamId: args.teamId });
    const knownPuuids = new Set(players.map((p: any) => p.puuid).filter(Boolean));

    const { cluster } = getRegionInfo(team.region);

    try {
      const { mData } = await getMatchDetails(args.matchId, cluster);
      const participants = mData.info.participants;

      let myTeamId = 100;
      const blueOverlap = participants.filter((p: any) => p.teamId === 100 && knownPuuids.has(p.puuid)).length;
      const redOverlap = participants.filter((p: any) => p.teamId === 200 && knownPuuids.has(p.puuid)).length;

      if (blueOverlap > 0 || redOverlap > 0) {
        myTeamId = blueOverlap >= redOverlap ? 100 : 200;
      }

      const myTeamParts = participants.filter((p: any) => p.teamId === myTeamId);
      const enemyTeamParts = participants.filter((p: any) => p.teamId !== myTeamId);
      const gameDurationMinutes = mData.info.gameDuration / 60;

      const formatP = (p: any) => ({
        ...parseParticipant(p, gameDurationMinutes),
        riotIdGameName: p.riotIdGameName,
        riotIdTagline: p.riotIdTagline,
        role: p.individualPosition,
      });

      await ctx.runMutation(api.scouting.addScoutingMatch, {
        teamId: args.teamId,
        matchId: args.matchId,
        tournament: args.tournament,
        notes: args.notes,
        date: mData.info.gameEndTimestamp,
        duration: mData.info.gameDuration,
        win: myTeamParts[0].win,
        myTeam: myTeamParts.map(formatP),
        enemyTeam: enemyTeamParts.map(formatP),
        snapshots: {}, // Simplified for now
        objectives: {}, // Simplified for now
      });

    } catch (e) {
      console.error("Team Match Registration Failed:", e);
      throw e;
    }
  },
});
