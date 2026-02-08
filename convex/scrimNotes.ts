import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addNote = mutation({
    args: {
        scrimId: v.id("scrims"),
        category: v.union(v.literal("tactical"), v.literal("draft"), v.literal("behavior"), v.literal("general")),
        content: v.string(),
        author: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("scrimNotes", {
            ...args,
            createdAt: Date.now(),
        });
    },
});

export const getNotesByScrim = query({
    args: { scrimId: v.id("scrims") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("scrimNotes")
            .withIndex("by_scrim", (q) => q.eq("scrimId", args.scrimId))
            .collect();
    },
});

export const deleteNote = mutation({
    args: { id: v.id("scrimNotes") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
