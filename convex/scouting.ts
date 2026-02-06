import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getTeamById = query({
  args: { id: v.id("scoutingTeams") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getScoutedTeams = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scoutingTeams")
      .filter((q) => q.eq(q.field("scoutedBy"), args.teamId))
      .collect();
  },
});

export const addScoutedTeam = mutation({
  args: {
    name: v.string(),
    region: v.string(),
    tier: v.union(v.literal("S"), v.literal("A"), v.literal("B"), v.literal("C")),
    winRate: v.number(),
    recentForm: v.array(v.string()),
    notes: v.string(),
    alerts: v.number(),
    matchesAnalyzed: v.number(),
    scoutedBy: v.id("teams"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scoutingTeams", args);
  },
});

export const removeScoutedTeam = mutation({
  args: { id: v.id("scoutingTeams") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
export const updateNotes = mutation({
  args: { id: v.id("scoutingTeams"), notes: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { notes: args.notes });
  },
});

// --- SCOUTED PLAYERS ---

export const getPlayerById = query({
  args: { id: v.id("scoutedPlayers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPlayersByTeam = query({
  args: { teamId: v.id("scoutingTeams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scoutedPlayers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

export const addScoutedPlayer = mutation({
  args: {
    teamId: v.id("scoutingTeams"),
    name: v.string(),
    tagline: v.string(),
    region: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scoutedPlayers", args);
  },
});

export const updatePlayerData = mutation({
  args: {
    id: v.id("scoutedPlayers"),
    puuid: v.string(),
    summonerId: v.optional(v.string()),
    rank: v.string(),
    tier: v.optional(v.string()),
    lp: v.number(),
    winRate: v.number(),
    games: v.number(),
    matches: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, {
      ...data,
      lastUpdated: Date.now(),
    });
  },
});

export const removeScoutedPlayer = mutation({
  args: { id: v.id("scoutedPlayers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
