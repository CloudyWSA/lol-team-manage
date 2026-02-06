import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getBoard = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const columns = await ctx.db
      .query("columns")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .collect();
    
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    return { columns: columns.sort((a,b) => a.order - b.order), tasks };
  },
});

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(v.literal("Baixa"), v.literal("Media"), v.literal("Alta"), v.literal("Critica")),
    deadline: v.string(),
    columnId: v.id("columns"),
    assignees: v.array(v.id("users")),
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      ...args,
      comments: 0,
    });
  },
});

export const moveTask = mutation({
  args: { id: v.id("tasks"), columnId: v.id("columns") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { columnId: args.columnId });
  },
});

export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("Baixa"), v.literal("Media"), v.literal("Alta"), v.literal("Critica"))),
    deadline: v.optional(v.string()),
    assignees: v.optional(v.array(v.id("users"))),
    observations: v.optional(v.string()),
    columnId: v.optional(v.id("columns")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
export const createColumn = mutation({
  args: {
    title: v.string(),
    color: v.string(),
    order: v.number(),
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("columns", args);
  },
});

export const updateColumn = mutation({
  args: {
    id: v.id("columns"),
    title: v.optional(v.string()),
    color: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteColumn = mutation({
  args: { id: v.id("columns") },
  handler: async (ctx, args) => {
    // Also delete tasks in this column or move them? 
    // For now, let's just delete the column.
    await ctx.db.delete(args.id);
  },
});

export const initializeDefaultColumns = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const defaults = [
      { title: "Pendente", color: "border-yellow-500", order: 0 },
      { title: "Em Processo", color: "border-blue-500", order: 1 },
      { title: "Concluído", color: "border-green-500", order: 2 },
    ];
    
    for (const col of defaults) {
      await ctx.db.insert("columns", {
        ...col,
        teamId: args.teamId,
      });
    }
  },
});

export const addComment = mutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Increment comment count on task
    const task = await ctx.db.get(args.taskId);
    if (task) {
      await ctx.db.patch(args.taskId, { comments: (task.comments || 0) + 1 });
    }

    return await ctx.db.insert("comments", {
      taskId: args.taskId,
      userId: args.userId,
      content: args.content,
      createdAt: new Date().toISOString(),
    });
  },
});

export const getComments = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc") // Newest first
      .collect();

    // Join with user data
    const commentsWithUser = await Promise.all(
      comments.map(async (c) => {
        const user = await ctx.db.get(c.userId);
        return {
          ...c,
          authorName: user?.name,
          authorAvatar: user?.avatar,
        };
      })
    );

    return commentsWithUser;
  },
});
