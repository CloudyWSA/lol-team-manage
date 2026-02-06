import { v } from "convex/values";
import { query } from "./_generated/server";

export const getTeamPerformance = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const scrims = await ctx.db
      .query("scrims")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("status"), "concluido"))
      .collect();
      
    const matches = await ctx.db
      .query("officialMatches")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const totalGames = scrims.length + matches.length;
    const wins = scrims.filter(s => s.won).length + matches.filter(m => m.won).length;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

    // Aggregate objectives from games
    const allScrimGames = await Promise.all(
      scrims.map(s => ctx.db.query("scrimGames").withIndex("by_scrim", q => q.eq("scrimId", s._id)).collect())
    );
    const allOfficialGames = await Promise.all(
      matches.map(m => ctx.db.query("officialGames").withIndex("by_match", q => q.eq("matchId", m._id)).collect())
    );

    const allGames = [...allScrimGames.flat(), ...allOfficialGames.flat()];
    const gamesWithObjectives = allGames.filter(g => g.objectives);
    const totalG = gamesWithObjectives.length || 1;

    const objectiveStats = [
      { name: "First Blood", rate: Math.round((gamesWithObjectives.filter(g => g.objectives?.firstBlood).length / totalG) * 100) },
      { name: "First Tower", rate: Math.round((gamesWithObjectives.filter(g => g.objectives?.firstTower).length / totalG) * 100) },
      { name: "Baron Nashor", rate: Math.round((gamesWithObjectives.filter(g => g.objectives?.baron).length / totalG) * 100) },
      { name: "Dragon Soul", rate: Math.round((gamesWithObjectives.filter(g => g.objectives?.soul).length / totalG) * 100) },
    ];

    // Calculate Average Duration
    const totalDurationSeconds = allGames.reduce((acc, g) => {
      const [mins, secs] = g.duration.split(':').map(Number);
      return acc + (mins * 60) + secs;
    }, 0);
    const avgSeconds = allGames.length > 0 ? totalDurationSeconds / allGames.length : 0;
    const avgMinsString = Math.floor(avgSeconds / 60).toString().padStart(2, '0');
    const avgSecsString = Math.floor(avgSeconds % 60).toString().padStart(2, '0');
    const averageDuration = `${avgMinsString}:${avgSecsString}`;

    // Historical data from snapshots
    // We'll take the snapshots for all players in the team and average them by week
    const teamUsers = await ctx.db.query("users").withIndex("by_team", q => q.eq("teamId", args.teamId)).collect();
    const snapshots = await Promise.all(
      teamUsers.map(u => ctx.db.query("playerPerformanceSnapshots").withIndex("by_user", q => q.eq("userId", u._id)).collect())
    );
    
    const flatSnapshots = snapshots.flat();
    const weeks = [...new Set(flatSnapshots.map(s => s.week))].sort();
    const performanceHistory = weeks.map(week => {
      const weekSnaps = flatSnapshots.filter(s => s.week === week);
      const avg = weekSnaps.reduce((acc, s) => acc + s.rating, 0) / weekSnaps.length;
      return { week, rating: Number(avg.toFixed(1)) };
    });

    return {
      totalGames,
      wins,
      winRate,
      averageDuration,
      performanceHistory: performanceHistory.length > 0 ? performanceHistory : [
        { week: "S-1", rating: 0 },
        { week: "Atual", rating: 0 }
      ],
      objectives: objectiveStats
    };
  },
});

export const getPlayerStats = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const players = await ctx.db
      .query("users")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("role"), "player"))
      .collect();

    const stats = await Promise.all(
      players.map(async (p) => {
        const gameStats = await ctx.db
          .query("playerGameStats")
          .withIndex("by_user", (q) => q.eq("userId", p._id))
          .order("desc")
          .take(10);

        if (gameStats.length === 0) {
          return {
            id: p._id,
            name: p.name,
            role: p.position || "Flex",
            kda: "0.0",
            cs: "0.0",
            dmg: "0%",
            winRate: p.riotAccount?.winRate || 0,
          };
        }

        const totals = gameStats.reduce((acc, s) => ({
          kills: acc.kills + s.kills,
          deaths: acc.deaths + s.deaths,
          assists: acc.assists + s.assists,
          cs: acc.cs + s.cs,
          dmg: acc.dmg + s.damageDealt
        }), { kills: 0, deaths: 0, assists: 0, cs: 0, dmg: 0 });

        const count = gameStats.length;
        const kda = ((totals.kills + totals.assists) / (Math.max(1, totals.deaths))).toFixed(1);
        const avgCs = (totals.cs / count).toFixed(1);
        
        // Mocking damage share for now as it needs context of other players in same game
        return {
          id: p._id,
          name: p.name,
          role: p.position || "Flex",
          kda,
          cs: avgCs,
          dmg: "20%", // Simplified
          winRate: p.riotAccount?.winRate || 0,
        };
      })
    );

    return stats;
  }
});
