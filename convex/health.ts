import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("healthProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    weight: v.number(),
    height: v.number(),
    age: v.number(),
    sex: v.union(v.literal("male"), v.literal("female"), v.literal("not_informed")),
    activityLevel: v.string(),
    goal: v.union(v.literal("lose"), v.literal("maintain"), v.literal("gain")),
    sleepGoal: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("healthProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (existing) {
      const { userId, ...updates } = args;
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      return await ctx.db.insert("healthProfiles", args);
    }
  },
});

export const getRecord = query({
  args: { userId: v.id("users"), date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("healthRecords")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", args.date))
      .unique();
  },
});

export const updateRecord = mutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    sleep: v.optional(v.object({
      hours: v.number(),
      quality: v.number(),
    })),
    mood: v.optional(v.object({
      score: v.number(),
      energy: v.number(),
      stress: v.number(),
    })),
    hydration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, date, ...updates } = args;
    const existing = await ctx.db
      .query("healthRecords")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
      .unique();
    
    if (existing) {
      await ctx.db.patch(existing._id, updates);
    } else {
      await ctx.db.insert("healthRecords", args);
    }
  },
});

export const getMeals = query({
  args: { userId: v.id("users"), date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meals")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", args.date))
      .collect();
  },
});

export const addMeal = mutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    time: v.string(),
    type: v.string(),
    name: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("meals", args);
  },
});

export const getAppointments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
export const getRecordHistory = query({
  args: { userId: v.id("users"), limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("healthRecords")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit);
  },
});
export const listTeamHealth = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const results = await Promise.all(
      users.map(async (user) => {
        const record = await ctx.db
          .query("healthRecords")
          .withIndex("by_user_date", (q) => q.eq("userId", user._id))
          .order("desc")
          .first();

        // Also get some historical data for trends (last 7 days)
        const history = await ctx.db
          .query("healthRecords")
          .withIndex("by_user_date", (q) => q.eq("userId", user._id))
          .order("desc")
          .take(7);

        return {
          user,
          latestRecord: record,
          history: history.reverse(),
        };
      })
    );

    return results;
  },
});
