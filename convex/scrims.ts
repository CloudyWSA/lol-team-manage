import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scrims")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    teamId: v.id("teams"),
    opponent: v.string(),
    date: v.string(),
    time: v.string(),
    format: v.union(v.literal("BO1"), v.literal("BO3"), v.literal("BO5")),
    server: v.string(),
    status: v.union(v.literal("confirmado"), v.literal("pendente")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scrims", args);
  },
});

export const updateStatus = mutation({
  args: { id: v.id("scrims"), status: v.union(v.literal("confirmado"), v.literal("pendente")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const remove = mutation({
  args: { id: v.id("scrims") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
export const listCompleted = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scrims")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("status"), "concluido"))
      .order("desc")
      .collect();
  },
});

export const getScrimWithGames = query({
  args: { id: v.id("scrims") },
  handler: async (ctx, args) => {
    const scrim = await ctx.db.get(args.id);
    if (!scrim) return null;
    const games = await ctx.db
      .query("scrimGames")
      .withIndex("by_scrim", (q) => q.eq("scrimId", args.id))
      .collect();
    return { ...scrim, games };
  },
});

export const createGame = mutation({
  args: {
    scrimId: v.id("scrims"),
    gameNumber: v.number(),
    result: v.union(v.literal("W"), v.literal("L")),
    duration: v.string(),
    side: v.union(v.literal("Blue"), v.literal("Red")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scrimGames", args);
  },
});
export const updateTrainingPlan = mutation({
  args: {
    id: v.id("scrims"),
    trainingPlan: v.object({
      objectives: v.array(v.string()),
      focus: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { trainingPlan: args.trainingPlan });
  },
});

export const updateOpponentProfile = mutation({
  args: { id: v.id("scrims"), opponentProfile: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { opponentProfile: args.opponentProfile });
  },
});
export const addDetailedGame = mutation({
  args: {
    scrimId: v.id("scrims"),
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
      .query("scrimGames")
      .withIndex("by_scrim", (q) => q.eq("scrimId", args.scrimId))
      .filter((q) => q.eq(q.field("gameNumber"), args.gameNumber))
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, args);
    }

    return await ctx.db.insert("scrimGames", args);
  },
});
