import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getMe = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    
    if (user && user.avatar && !user.avatar.startsWith("http")) {
      const url = await ctx.storage.getUrl(user.avatar as Id<"_storage">);
      if (url) return { ...user, avatar: url };
    }
    return user;
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (user && user.avatar && !user.avatar.startsWith("http")) {
      const url = await ctx.storage.getUrl(user.avatar as Id<"_storage">);
      if (url) return { ...user, avatar: url };
    }
    return user;
  },
});

export const listByTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    // Resolve avatars
    return await Promise.all(users.map(async (u) => {
      if (u.avatar && !u.avatar.startsWith("http")) {
        const url = await ctx.storage.getUrl(u.avatar as Id<"_storage">);
        if (url) return { ...u, avatar: url };
      }
      return u;
    }));
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("coach"), v.literal("player"), v.literal("analyst")),
    teamId: v.id("teams"),
    position: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) throw new Error("Usuário já cadastrado");

    return await ctx.db.insert("users", {
      ...args,
      isOnline: false,
    });
  },
});

export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("coach"), v.literal("player"), v.literal("analyst")),
    teamName: v.optional(v.string()),
    inviteCode: v.optional(v.string()),
    position: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existingUser) throw new Error("Email já está em uso.");

    let teamId;

    // 2. Handle Invitation or Team Creation
    if (args.inviteCode) {
      const invite = await ctx.db
        .query("invitations")
        .withIndex("by_code", (q) => q.eq("code", args.inviteCode ?? ""))
        .unique();

      if (!invite || invite.used || invite.expiresAt < Date.now()) {
        throw new Error("Convite inválido ou expirado.");
      }

      teamId = invite.teamId;
      // Mark invite as used
      await ctx.db.patch(invite._id, { used: true });
    } else if (args.teamName) {
      let team = await ctx.db
        .query("teams")
        .filter((q) => q.eq(q.field("name"), args.teamName))
        .unique();

      if (!team) {
        teamId = await ctx.db.insert("teams", {
          name: args.teamName,
        });
      } else {
        teamId = team._id;
      }
    } else {
      throw new Error("É necessário um nome de time ou código de convite.");
    }

    // 3. Create User
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: args.role,
      teamId: teamId,
      position: args.position,
      isOnline: true,
      preferences: {
        language: "pt",
        theme: "dark",
        notifications: true,
      }
    });

    return userId;
  },
});

export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updatePresence = mutation({
  args: { id: v.id("users"), isOnline: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isOnline: args.isOnline });
  },
});
export const updateProfile = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    position: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const updatePreferences = mutation({
  args: {
    id: v.id("users"),
    preferences: v.object({
      language: v.union(v.literal("pt"), v.literal("en")),
      theme: v.union(v.literal("dark"), v.literal("light")),
      notifications: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { preferences: args.preferences });
  },
});

export const wipeAll = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    for (const user of allUsers) await ctx.db.delete(user._id);
    
    const allTeams = await ctx.db.query("teams").collect();
    for (const team of allTeams) await ctx.db.delete(team._id);

    const allTasks = await ctx.db.query("tasks").collect();
    for (const task of allTasks) await ctx.db.delete(task._id);

    const allEvents = await ctx.db.query("agendaEvents").collect();
    for (const e of allEvents) await ctx.db.delete(e._id);
    
    // Add other tables as needed...
    console.log("Database wiped successfully.");
  },
});
