import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const matches = await ctx.db
      .query("officialMatches")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
    
    return matches.sort((a, b) => b.date.localeCompare(a.date));
  },
});

export const getMatchWithGames = query({
  args: { matchId: v.id("officialMatches") },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    const games = await ctx.db
      .query("officialGames")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();
    
    return { ...match, games: games.sort((a,b) => a.gameNumber - b.gameNumber) };
  },
});

export const createMatch = mutation({
  args: {
    tournament: v.string(),
    opponent: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    stage: v.string(),
    broadcast: v.optional(v.string()),
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("officialMatches", args);
  },
});

export const deleteMatch = mutation({
  args: { id: v.id("officialMatches") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const addDetailedGame = mutation({
  args: {
    matchId: v.id("officialMatches"),
    riotMatchId: v.string(),
    gameNumber: v.number(),
    result: v.union(v.literal("W"), v.literal("L")),
    duration: v.string(),
    side: v.union(v.literal("Blue"), v.literal("Red")),
    participants: v.array(v.object({
      puuid: v.string(),
      summonerName: v.string(),
      championName: v.string(),
      role: v.string(),
      teamId: v.number(),
      kills: v.number(),
      deaths: v.number(),
      assists: v.number(),
      totalDamageDealtToChampions: v.number(),
      goldEarned: v.number(),
      win: v.boolean(),
      items: v.optional(v.array(v.number())),
      cs: v.optional(v.number()),
      dpm: v.optional(v.number()),
      visionScore: v.optional(v.number()),
      snapshots: v.optional(v.object({
        at10: v.object({ gold: v.number(), cs: v.number(), xp: v.number() }),
        at15: v.object({ gold: v.number(), cs: v.number(), xp: v.number() }),
      })),
    })),
    blueStats: v.optional(v.object({
      gold: v.number(),
      kills: v.number(),
      towers: v.number(),
      dragons: v.number(),
      barons: v.number(),
      grubs: v.number(),
    })),
    redStats: v.optional(v.object({
      gold: v.number(),
      kills: v.number(),
      towers: v.number(),
      dragons: v.number(),
      barons: v.number(),
      grubs: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // Check if game already exists
    const existing = await ctx.db
      .query("officialGames")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => q.eq(q.field("gameNumber"), args.gameNumber))
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, args);
    }

    return await ctx.db.insert("officialGames", args);
  },
});
