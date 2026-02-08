import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // --- CORE & AUTH ---
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("coach"), v.literal("player"), v.literal("analyst"), v.literal("psychologist")),
    password: v.optional(v.string()),
    position: v.optional(v.string()), // Top, Jungle, Mid, ADC, Support
    teamId: v.id("teams"),
    avatar: v.optional(v.string()),
    isOnline: v.boolean(),
    riotAccount: v.optional(v.object({
      rank: v.string(),
      lp: v.number(),
      lpDelta: v.number(),
      gamesCount: v.number(),
      winRate: v.number(),
      lastPlayed: v.string(),
      summonerName: v.optional(v.string()), // For fetching real data later
    })),
    preferences: v.optional(v.object({
      language: v.union(v.literal("pt"), v.literal("en")),
      theme: v.union(v.literal("dark"), v.literal("light")),
      notifications: v.boolean(),
    })),
  }).index("by_email", ["email"]).index("by_team", ["teamId"]),

  teams: defineTable({
    name: v.string(),
    logo: v.optional(v.string()),
  }),

  invitations: defineTable({
    teamId: v.id("teams"),
    code: v.string(), // Random short code
    email: v.optional(v.string()), // Optional, if we want to restrict to email
    role: v.union(v.literal("coach"), v.literal("player"), v.literal("analyst"), v.literal("psychologist")),
    position: v.optional(v.string()),
    expiresAt: v.number(), // Timestamp
    used: v.boolean(),
  }).index("by_team", ["teamId"]).index("by_code", ["code"]),

  // --- KANBAN / TASKS ---
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(v.literal("Baixa"), v.literal("Media"), v.literal("Alta"), v.literal("Critica")),
    deadline: v.string(),
    columnId: v.id("columns"),
    assignees: v.array(v.id("users")),
    comments: v.number(),
    observations: v.optional(v.string()),
    teamId: v.id("teams"),
  }).index("by_team", ["teamId"]),

  comments: defineTable({
    taskId: v.id("tasks"),
    userId: v.id("users"),
    content: v.string(),
    createdAt: v.string(),
  }).index("by_task", ["taskId"]),

  columns: defineTable({
    title: v.string(),
    color: v.string(),
    order: v.number(),
    teamId: v.id("teams"),
  }),

  // --- COMPETITIVE / MATCHES ---
  scrims: defineTable({
    opponent: v.string(),
    date: v.string(),
    time: v.string(),
    format: v.union(v.literal("BO1"), v.literal("BO3"), v.literal("BO5")),
    server: v.string(),
    status: v.union(v.literal("confirmado"), v.literal("pendente"), v.literal("concluido")),
    notes: v.optional(v.string()),
    teamId: v.id("teams"),
    result: v.optional(v.string()),
    won: v.optional(v.boolean()),
    rating: v.optional(v.number()), // 1-5 stars
    trainingPlan: v.optional(v.object({
      objectives: v.array(v.string()),
      focus: v.string(),
    })),
    opponentProfile: v.optional(v.string()),
  }).index("by_team", ["teamId"]),

  scrimGames: defineTable({
    scrimId: v.id("scrims"),
    riotMatchId: v.optional(v.string()),
    gameNumber: v.number(),
    result: v.union(v.literal("W"), v.literal("L")),
    duration: v.string(),
    side: v.union(v.literal("Blue"), v.literal("Red")),
    participants: v.optional(v.array(v.object({
      puuid: v.string(),
      summonerName: v.string(), // riotIdGameName + tagline
      championName: v.string(),
      role: v.string(),
      teamId: v.number(), // 100 or 200
      kills: v.number(),
      deaths: v.number(),
      assists: v.number(),
      totalDamageDealtToChampions: v.number(),
      goldEarned: v.number(),
      win: v.boolean(),
      items: v.optional(v.array(v.number())),
      cs: v.optional(v.number()),
      dpm: v.optional(v.number()),
      visionScore: v.optional(v.number()),
    }))),
    blueStats: v.optional(v.object({
      gold: v.number(),
      kills: v.number(),
      towers: v.number(),
      dragons: v.number(),
      barons: v.number(),
      grubs: v.number(),
    })),
    redStats: v.optional(v.object({
      gold: v.number(),
      kills: v.number(),
      towers: v.number(),
      dragons: v.number(),
      barons: v.number(),
      grubs: v.number(),
    })),
    objectives: v.optional(v.object({
      firstBlood: v.boolean(),
      firstTower: v.boolean(),
      baron: v.boolean(),
      soul: v.boolean(),
    })),
  }).index("by_scrim", ["scrimId"]),

  officialMatches: defineTable({
    tournament: v.string(),
    opponent: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    stage: v.string(), // e.g. "Semana 3", "Quartas de Final"
    broadcast: v.optional(v.string()),
    result: v.optional(v.string()),
    won: v.optional(v.boolean()),
    teamId: v.id("teams"),
  }).index("by_team", ["teamId"]),

  officialGames: defineTable({
    matchId: v.id("officialMatches"),
    gameNumber: v.number(),
    duration: v.string(),
    kills: v.number(),
    deaths: v.number(),
    assists: v.number(),
    side: v.union(v.literal("Blue"), v.literal("Red")),
    mvp: v.optional(v.string()),
    goldDiff: v.string(),
    win: v.boolean(),
    objectives: v.optional(v.object({
      firstBlood: v.boolean(),
      firstTower: v.boolean(),
      baron: v.boolean(),
      soul: v.boolean(),
    })),
  }).index("by_match", ["matchId"]),

  // --- STRATEGIC & STAFF ---
  agendaEvents: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.string(),
    endTime: v.string(),
    type: v.union(v.literal("Review"), v.literal("Treino"), v.literal("Estratégia"), v.literal("Outro")),
    status: v.union(v.literal("Confirmado"), v.literal("Pendente"), v.literal("Cancelado")),
    location: v.string(),
    assignees: v.array(v.string()), // Names or Roles
    observations: v.optional(v.string()),
    priority: v.union(v.literal("Baixa"), v.literal("Media"), v.literal("Alta")),
    teamId: v.id("teams"),
    date: v.string(), // ISO format or similar
  }).index("by_team_date", ["teamId", "date"]),

  scoutingTeams: defineTable({
    name: v.string(),
    region: v.string(),
    tier: v.union(v.literal("S"), v.literal("A"), v.literal("B"), v.literal("C")),
    winRate: v.number(),
    recentForm: v.array(v.string()),
    notes: v.string(),
    alerts: v.number(),
    matchesAnalyzed: v.number(),
    scoutedBy: v.id("teams"),
  }),

  scoutedPlayers: defineTable({
    teamId: v.id("scoutingTeams"),
    name: v.string(), // Riot ID Name
    tagline: v.string(), // Riot ID Tag
    region: v.string(), // e.g., "br1", "na1"
    puuid: v.optional(v.string()),
    summonerId: v.optional(v.string()),
    rank: v.optional(v.string()), // e.g., "CHALLENGER"
    tier: v.optional(v.string()), // e.g., "I"
    lp: v.optional(v.number()),
    winRate: v.optional(v.number()),
    games: v.optional(v.number()),
    lastUpdated: v.optional(v.number()),
    matches: v.optional(v.array(v.any())),
  }).index("by_team", ["teamId"]).index("by_puuid", ["puuid"]),

  scoutingMatches: defineTable({
    teamId: v.id("scoutingTeams"),
    matchId: v.string(),
    tournament: v.optional(v.string()),
    notes: v.optional(v.string()),
    date: v.number(),
    duration: v.number(),
    win: v.boolean(),
    myTeam: v.array(v.any()), // Full stats & composition
    enemyTeam: v.array(v.any()),
    snapshots: v.any(), // 10m, 15m, 20m aggregated data
    objectives: v.any(),
  }).index("by_team", ["teamId"]),

  coachAlerts: defineTable({
    type: v.union(v.literal("performance"), v.literal("health")),
    userId: v.id("users"),
    message: v.string(),
    severity: v.union(v.literal("alto"), v.literal("médio"), v.literal("baixo")),
    teamId: v.id("teams"),
    isRead: v.boolean(),
  }).index("by_team", ["teamId"]),

  // --- HEALTH & PERFORMANCE ---
  healthProfiles: defineTable({
    userId: v.id("users"),
    weight: v.number(),
    height: v.number(),
    age: v.number(),
    sex: v.union(v.literal("male"), v.literal("female"), v.literal("not_informed")),
    activityLevel: v.string(),
    goal: v.union(v.literal("lose"), v.literal("maintain"), v.literal("gain")),
    sleepGoal: v.number(),
  }).index("by_user", ["userId"]),

  healthRecords: defineTable({
    userId: v.id("users"),
    date: v.string(),
    sleep: v.optional(v.object({
      hours: v.number(),
      quality: v.number(),
      notes: v.optional(v.string()),
    })),
    mood: v.optional(v.object({
      score: v.number(),
      energy: v.number(),
      stress: v.number(),
      notes: v.optional(v.string()),
    })),
    hydration: v.optional(v.number()), // in liters
  }).index("by_user_date", ["userId", "date"]),

  meals: defineTable({
    userId: v.id("users"),
    date: v.string(),
    time: v.string(),
    type: v.string(), // Lunch, Breakfast, etc.
    name: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
  }).index("by_user_date", ["userId", "date"]),

  appointments: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(), // "Psicólogo", "Nutricionista", "Fisioterapeuta", etc.
    professional: v.string(), // Name or ID
    date: v.string(),
    time: v.string(),
    status: v.union(v.literal("confirmado"), v.literal("agendado"), v.literal("pendente"), v.literal("cancelado")),
    observations: v.optional(v.string()),
    teamId: v.id("teams"),
  }).index("by_user", ["userId"]).index("by_team", ["teamId"]),

  playerPerformanceSnapshots: defineTable({
    userId: v.id("users"),
    week: v.string(),
    rating: v.number(), // Scale 1-10
  }).index("by_user", ["userId"]),

  playerGameStats: defineTable({
    userId: v.id("users"),
    gameId: v.string(), // ID from scrimGames or officialGames (as string for simplicity in union)
    gameType: v.union(v.literal("scrim"), v.literal("official")),
    kills: v.number(),
    deaths: v.number(),
    assists: v.number(),
    cs: v.number(),
    damageDealt: v.number(),
    goldEarned: v.number(),
    teamId: v.id("teams"),
    date: v.string(),
  }).index("by_user", ["userId"]).index("by_team", ["teamId"]),

  scoutingMedia: defineTable({
    teamId: v.id("scoutingTeams"),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("youtube")),
    title: v.string(),
    description: v.optional(v.string()),
    url: v.optional(v.string()), // For YouTube or external links
    storageId: v.optional(v.id("_storage")), // For Convex storage
    tags: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_team", ["teamId"]),

  scrimMedia: defineTable({
    scrimId: v.id("scrims"),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("youtube")),
    title: v.string(),
    description: v.optional(v.string()),
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    tags: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_scrim", ["scrimId"]),

  scrimNotes: defineTable({
    scrimId: v.id("scrims"),
    category: v.union(v.literal("tactical"), v.literal("draft"), v.literal("behavior"), v.literal("general")),
    content: v.string(),
    author: v.string(),
    createdAt: v.number(),
  }).index("by_scrim", ["scrimId"]),

});
