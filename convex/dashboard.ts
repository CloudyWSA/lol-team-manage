import { v } from "convex/values";
import { query } from "./_generated/server";

export const getPlayerDashboardData = query({
  args: { userId: v.id("users"), teamId: v.id("teams") },
  handler: async (ctx, args) => {
    // 1. Next Appointment
    const appointment = await ctx.db
      .query("appointments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "confirmado"))
      .first();

    // 2. Health Record (Today/Yesterday)
    const health = await ctx.db
      .query("healthRecords")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    // 3. Next Scrims/Matches
    const nextEvents = await ctx.db
      .query("agendaEvents")
      .withIndex("by_team_date", (q) => q.eq("teamId", args.teamId))
      .order("desc") // Simplified, ideally relative to "now"
      .take(3);

    // 4. Recent Matches
    const recentMatches = await ctx.db
      .query("officialMatches")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .take(3);

    return { appointment, health, nextEvents, recentMatches };
  },
});

export const getCoachDashboardData = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    // 1. Alerts
    const alerts = await ctx.db
      .query("coachAlerts")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    // 2. Tasks
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .take(5);

    // 3. Team Players Stats
    const players = await ctx.db
      .query("users")
      .filter((q) => q.and(q.eq(q.field("teamId"), args.teamId), q.eq(q.field("role"), "player")))
      .collect();

    const playerStats = [];
    for (const p of players) {
      const profile = await ctx.db
        .query("healthProfiles")
        .withIndex("by_user", (q) => q.eq("userId", p._id))
        .unique();
      const lastHealth = await ctx.db
        .query("healthRecords")
        .withIndex("by_user_date", (q) => q.eq("userId", p._id))
        .order("desc")
        .first();
      playerStats.push({ ...p, profile, lastHealth });
    }

    return { alerts, tasks, playerStats };
  },
});
