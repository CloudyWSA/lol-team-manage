import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveMedia = mutation({
  args: {
    teamId: v.id("scoutingTeams"),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("youtube")),
    title: v.string(),
    description: v.optional(v.string()),
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scoutingMedia", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getMediaByTeam = query({
  args: { teamId: v.id("scoutingTeams") },
  handler: async (ctx, args) => {
    const media = await ctx.db
      .query("scoutingMedia")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    return await Promise.all(
      media.map(async (item) => {
        if (item.storageId) {
          return {
            ...item,
            url: await ctx.storage.getUrl(item.storageId),
          };
        }
        return item;
      })
    );
  },
});

export const deleteMedia = mutation({
  args: { id: v.id("scoutingMedia") },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.id);
    if (!media) return;
    
    if (media.storageId) {
      await ctx.storage.delete(media.storageId);
    }
    
    await ctx.db.delete(args.id);
  },
});

export const saveScrimMedia = mutation({
  args: {
    scrimId: v.id("scrims"),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("youtube")),
    title: v.string(),
    description: v.optional(v.string()),
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scrimMedia", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getScrimMedia = query({
  args: { scrimId: v.id("scrims") },
  handler: async (ctx, args) => {
    const media = await ctx.db
      .query("scrimMedia")
      .withIndex("by_scrim", (q) => q.eq("scrimId", args.scrimId))
      .collect();

    return await Promise.all(
      media.map(async (item) => {
        if (item.storageId) {
          return {
            ...item,
            url: await ctx.storage.getUrl(item.storageId),
          };
        }
        return item;
      })
    );
  },
});

export const deleteScrimMedia = mutation({
  args: { id: v.id("scrimMedia") },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.id);
    if (!media) return;
    
    if (media.storageId) {
      await ctx.storage.delete(media.storageId);
    }
    
    await ctx.db.delete(args.id);
  },
});
