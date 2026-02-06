import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getEventsByDate = query({
  args: { teamId: v.id("teams"), date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agendaEvents")
      .withIndex("by_team_date", (q) => q.eq("teamId", args.teamId).eq("date", args.date))
      .collect();
  },
});

export const listAllForTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agendaEvents")
      .withIndex("by_team_date", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.string(),
    endTime: v.string(),
    type: v.union(v.literal("Review"), v.literal("Treino"), v.literal("Estratégia"), v.literal("Outro")),
    status: v.union(v.literal("Confirmado"), v.literal("Pendente"), v.literal("Cancelado")),
    location: v.string(),
    assignees: v.array(v.string()),
    priority: v.union(v.literal("Baixa"), v.literal("Media"), v.literal("Alta")),
    teamId: v.id("teams"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agendaEvents", args);
  },
});

export const updateEvent = mutation({
  args: {
    id: v.id("agendaEvents"),
    title: v.optional(v.string()),
    status: v.optional(v.union(v.literal("Confirmado"), v.literal("Pendente"), v.literal("Cancelado"))),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteEvent = mutation({
  args: { id: v.id("agendaEvents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
