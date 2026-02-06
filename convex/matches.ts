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
    stage: v.string(),
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("officialMatches", args);
  },
});
