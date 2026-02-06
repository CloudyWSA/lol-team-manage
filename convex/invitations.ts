import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a random 8-character code
function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export const create = mutation({
  args: {
    teamId: v.id("teams"),
    role: v.union(v.literal("coach"), v.literal("player"), v.literal("analyst")),
    email: v.optional(v.string()),
    position: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const code = generateCode();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    const invitationId = await ctx.db.insert("invitations", {
      ...args,
      code,
      expiresAt,
      used: false,
    });

    return { id: invitationId, code };
  },
});

export const listByTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invitations")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("used"), false))
      .collect();
  },
});

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();

    if (!invitation || invitation.used || invitation.expiresAt < Date.now()) {
      return null;
    }

    const team = await ctx.db.get(invitation.teamId);
    return { ...invitation, teamName: team?.name };
  },
});

export const cancel = mutation({
  args: { id: v.id("invitations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
