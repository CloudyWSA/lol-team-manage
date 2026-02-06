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

// --- SCOUTING MATCHES ---
// Sync force comment
export const getScoutingMatches = query({
  args: { teamId: v.id("scoutingTeams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scoutingMatches")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .collect();
  },
});

export const addScoutingMatch = mutation({
  args: {
    teamId: v.id("scoutingTeams"),
    matchId: v.string(),
    tournament: v.optional(v.string()),
    notes: v.optional(v.string()),
    date: v.number(),
    duration: v.number(),
    win: v.boolean(),
    myTeam: v.array(v.any()),
    enemyTeam: v.array(v.any()),
    snapshots: v.any(),
    objectives: v.any(),
  },
  handler: async (ctx, args) => {
    // Check if match already exists for this team to prevent duplicates
    const existing = await ctx.db
      .query("scoutingMatches")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("matchId"), args.matchId))
      .first();

    if (existing) {
       // Update existing? Or just return? Let's update for now or just skip.
       // For this implementation, we'll replace/update if it exists, or just return existing ID.
       // Let's do an update to allow refreshing data.
       await ctx.db.patch(existing._id, args);
       return existing._id;
    }

    return await ctx.db.insert("scoutingMatches", args);
  },
});
