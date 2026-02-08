import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List appointments for a specific team, optionally filtered by user or date range
export const listAppointments = query({
    args: {
        teamId: v.id("teams"),
        userId: v.optional(v.id("users")),
        after: v.optional(v.string()), // Date string ISO or YYYY-MM-DD
        before: v.optional(v.string()), // Date string ISO or YYYY-MM-DD
    },
    handler: async (ctx, args) => {
        let queryExecution;

        if (args.userId) {
            queryExecution = ctx.db
                .query("appointments")
                .withIndex("by_user", (q) => q.eq("userId", args.userId!));
        } else {
            queryExecution = ctx.db
                .query("appointments")
                .withIndex("by_team", (q) => q.eq("teamId", args.teamId));
        }

        let results = await queryExecution.collect();

        // Filter in memory for now as complex multi-field filtering is limited in basic indexes
        // optimization: add specific indexes if volume grows
        if (args.userId) {
            results = results.filter(r => r.userId === args.userId);
        }

        if (args.after) {
            results = results.filter(r => r.date >= args.after!);
        }

        if (args.before) {
            results = results.filter(r => r.date <= args.before!);
        }

        // Sort by date and time
        return results.sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
        });
    },
});

export const createAppointment = mutation({
    args: {
        teamId: v.id("teams"),
        userId: v.id("users"),
        title: v.string(),
        description: v.optional(v.string()),
        type: v.string(),
        professional: v.string(),
        date: v.string(),
        time: v.string(),
        observations: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("appointments", {
            teamId: args.teamId,
            userId: args.userId,
            title: args.title,
            description: args.description,
            type: args.type,
            professional: args.professional,
            date: args.date,
            time: args.time,
            status: "agendado", // Default status
            observations: args.observations,
        });
        return id;
    },
});

export const updateAppointment = mutation({
    args: {
        id: v.id("appointments"),
        status: v.optional(v.union(v.literal("confirmado"), v.literal("agendado"), v.literal("pendente"), v.literal("cancelado"))),
        date: v.optional(v.string()),
        time: v.optional(v.string()),
        description: v.optional(v.string()),
        observations: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const deleteAppointment = mutation({
    args: {
        id: v.id("appointments"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
