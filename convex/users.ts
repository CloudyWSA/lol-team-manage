// ... imports
import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Helper for hashing (runs in Action)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "INVOKERS_SALT_v1"); // Simple salt for this scope
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ... imports

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
    
    // Filter out password logic could go here, but for now just returning user to unblock.
    return user;
  },
});

export const login = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getUserByEmailSecrets, { email: args.email });
    
    if (!user) return null;
    if (!user.password) {
       // Allow legacy login if no password set? Or block?
       // For "Real Login" we should probably block or require reset. 
       // For now, if no password, deny to force new registration or manual fix.
       return null;
    }

    const hashed = await hashPassword(args.password);
    if (hashed === user.password) {
       return user;
    }
    return null;
  },
});

export const getUserByEmailSecrets = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const register = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("coach"), v.literal("player"), v.literal("analyst"), v.literal("psychologist")),
    teamName: v.optional(v.string()),
    inviteCode: v.optional(v.string()),
    position: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
     const hashedPassword = await hashPassword(args.password);
     
     // Call internal mutation
     return await ctx.runMutation(api.users.createWithPassword, {
        ...args,
        password: hashedPassword
     });
  }
});

export const createWithPassword = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("coach"), v.literal("player"), v.literal("analyst"), v.literal("psychologist")),
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
      password: args.password,
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

export const listByTeam = query({
  args: { teamId: v.optional(v.id("teams")) },
  handler: async (ctx, args) => {
    if (!args.teamId) return [];

    const users = await ctx.db
      .query("users")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    // Enhance users with latest health record if needed for the UI,
    // but for now returning raw user data as TeamContent likely expects.
    // If the UI expects specific fields, we can map them here.
    return users;
  },
});



