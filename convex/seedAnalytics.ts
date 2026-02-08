import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const seedTeamMetrics = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const teamId = args.teamId;

    // Fetch existing players for this team
    const players = await ctx.db
      .query("users")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .filter((q) => q.eq(q.field("role"), "player"))
      .collect();

    if (players.length === 0) {
      throw new Error("No players found in this team to seed data for.");
    }

    const playerIds = players.map(p => p._id);

    // Create 10 scrims with games
    for (let s = 1; s <= 10; s++) {
      const scrimId = await ctx.db.insert("scrims", {
        opponent: `Treino Rival ${s}`,
        date: new Date(Date.now() - s * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: "14:00",
        format: "BO1",
        server: "BR",
        status: "concluido",
        teamId,
        result: Math.random() > 0.4 ? "W" : "L",
      });

      const scrim = await ctx.db.get(scrimId);
      const isWin = scrim?.result === "W";
      
      const gameId = await ctx.db.insert("scrimGames", {
        scrimId,
        gameNumber: 1,
        result: isWin ? "W" : "L",
        duration: `${20 + Math.floor(Math.random() * 20)}:00`,
        side: Math.random() > 0.5 ? "Blue" : "Red",
        objectives: {
          firstBlood: isWin ? Math.random() > 0.2 : Math.random() > 0.8,
          firstTower: isWin ? Math.random() > 0.3 : Math.random() > 0.7,
          baron: isWin ? Math.random() > 0.5 : Math.random() > 0.9,
          soul: isWin ? Math.random() > 0.6 : Math.random() > 0.95,
        }
      });

      // Stats for all players in the team
      for (const playerId of playerIds) {
        const winBias = isWin ? 1.5 : 0.7;
        await ctx.db.insert("playerGameStats", {
          userId: playerId,
          gameId: gameId,
          gameType: "scrim",
          kills: Math.floor((3 + Math.random() * 7) * winBias),
          deaths: Math.floor((5 + Math.random() * 5) / winBias),
          assists: Math.floor((10 + Math.random() * 10) * winBias),
          cs: Math.floor((150 + Math.random() * 150)),
          damageDealt: Math.floor((15000 + Math.random() * 20000) * winBias),
          goldEarned: Math.floor((10000 + Math.random() * 5000) * winBias),
          teamId,
          date: new Date(Date.now() - s * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    return { message: `Seeded 10 games for team ${teamId}` };
  }
});
