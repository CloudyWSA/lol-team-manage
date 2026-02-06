"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Moon,
  Utensils,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Users,
  ChevronRight,
  ChevronDown,
  Calendar,
  ArrowLeftRight,
  History,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@/lib/auth-context"
import { Id } from "@/convex/_generated/dataModel"

// Helper functions for health metrics
function calculateStatus(record: any) {
  if (!record) return "no-data"
  
  let score = 0
  let totalMetrics = 0

  if (record.sleep) {
    score += (record.sleep.hours / 8) * 100
    totalMetrics++
  }
  if (record.mood) {
    score += (record.mood.score / 5) * 100
    totalMetrics++
  }

  const finalScore = totalMetrics > 0 ? score / totalMetrics : 0

  if (finalScore >= 90) return "excellent"
  if (finalScore >= 75) return "good"
  if (finalScore >= 60) return "attention"
  return "critical"
}

function getAlerts(record: any) {
  if (!record) return []
  const alerts = []
  if (record.sleep && record.sleep.hours < 6) alerts.push("Sono crítico")
  if (record.sleep && record.sleep.hours < 7.5) alerts.push("Sono abaixo da média")
  if (record.mood && record.mood.score < 3) alerts.push("Humor baixo")
  if (record.mood && record.mood.stress > 4) alerts.push("Estresse elevado")
  return alerts
}

function getStatusColor(status: string) {
  switch (status) {
    case "excellent": return "text-green-500"
    case "good": return "text-blue-500"
    case "attention": return "text-yellow-500"
    case "critical": return "text-red-500"
    default: return "text-muted-foreground"
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "excellent": return <Badge className="bg-green-500/20 text-green-500">Excelente</Badge>
    case "good": return <Badge className="bg-blue-500/20 text-blue-500">Bom</Badge>
    case "attention": return <Badge className="bg-yellow-500/20 text-yellow-500">Atenção</Badge>
    case "critical": return <Badge className="bg-red-500/20 text-red-500">Crítico</Badge>
    default: return <Badge variant="outline">Sem dados</Badge>
  }
}

export function TeamHealthContent() {
  const { user } = useAuth()
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set())

  const teamData = useQuery(api.health.listTeamHealth, user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip")

  const togglePlayerExpanded = (playerId: string) => {
    setExpandedPlayers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(playerId)) newSet.delete(playerId)
      else newSet.add(playerId)
      return newSet
    })
  }

  // Historical dates for the last 7 days (generated dynamically)
  const historicalDates = useMemo(() => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const iso = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
      dates.push({ 
        date: iso, 
        label: label.charAt(0).toUpperCase() + label.slice(1), 
        fullLabel: d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })
      })
    }
    return dates
  }, [])

  const [selectedDate, setSelectedDate] = useState(historicalDates[0].date)
  const [comparisonDate, setComparisonDate] = useState(historicalDates[1].date)
  const [isComparisonMode, setIsComparisonMode] = useState(false)

  if (!teamData) return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando dados de saúde da equipe...</div>

  // Map backend data to frontend structure
  const playersHealth = teamData.map(d => ({
    id: d.user._id,
    name: d.user.name,
    position: d.user.position || "Sem Posição",
    avatar: d.user.name[0],
    sleep: { 
      avg: d.latestRecord?.sleep?.hours || 0, 
      quality: d.latestRecord?.sleep?.quality || 0,
      trend: 0 
    },
    mood: { 
      avg: d.latestRecord?.mood?.score || 0, 
      energy: d.latestRecord?.mood?.energy || 0, 
      stress: d.latestRecord?.mood?.stress || 0,
      trend: 0 
    },
    status: calculateStatus(d.latestRecord),
    alerts: getAlerts(d.latestRecord),
    lastUpdate: d.latestRecord ? new Date(d.latestRecord._creationTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : "Sem dados",
    history: d.history 
  }))

  const getPlayerDataForDate = (playerId: string, date: string) => {
    const player = playersHealth.find(p => p.id === playerId)
    if (!player) return null
    const record = player.history.find(h => h.date === date)
    if (!record) return null
    return {
      ...record,
      sleep: { avg: record.sleep?.hours || 0, quality: record.sleep?.quality || 0 },
      mood: { avg: record.mood?.score || 0, energy: record.mood?.energy || 0, stress: record.mood?.stress || 0 },
      status: calculateStatus(record),
      nutrition: { calories: 0, target: 2000, adherence: 0 },
      hydration: { avg: record.hydration || 0, target: 3.0 }
    }
  }

  const getPlayerTrendData = (playerId: string) => {
    const player = playersHealth.find(p => p.id === playerId)
    if (!player) return []
    return player.history.map(h => ({
      date: historicalDates.find(d => d.date === h.date)?.label || h.date.slice(-2),
      sono: h.sleep?.hours || 0,
      humor: h.mood?.score || 0,
      energia: h.mood?.energy || 0,
      estresse: h.mood?.stress || 0
    }))
  }

  const playersWithAlerts = playersHealth.filter((p) => p.alerts.length > 0)
  const teamSleepAvg = playersHealth.length > 0 
    ? playersHealth.reduce((acc, p) => acc + p.sleep.avg, 0) / playersHealth.length 
    : 0
  const teamMoodAvg = playersHealth.length > 0 
    ? playersHealth.reduce((acc, p) => acc + p.mood.avg, 0) / playersHealth.length 
    : 0

  // Weekly average for the chart
  const teamWeeklyData = historicalDates.map((dateItem: any) => {
    const dayRecords = teamData.flatMap((d: any) => d.history.filter((h: any) => h.date === dateItem.date))
    if (dayRecords.length === 0) return { day: dateItem.label, sleep: 0, mood: 0, energy: 0 }
    
    return {
      day: dateItem.label,
      sleep: dayRecords.reduce((acc, r) => acc + (r.sleep?.hours || 0), 0) / dayRecords.length,
      mood: dayRecords.reduce((acc, r) => acc + (r.mood?.score || 0), 0) / dayRecords.length,
      energy: dayRecords.reduce((acc, r) => acc + (r.mood?.energy || 0), 0) / dayRecords.length,
    }
  }).reverse()

  const calculateDelta = (current: number, previous: number) => {
    const diff = Number((current - previous).toFixed(1))
    return { value: diff, isPositive: diff >= 0 }
  }

  // Radar chart needs player names as keys
  const playerRadarData = [
    { metric: "Sono" },
    { metric: "Humor" },
    { metric: "Energia" },
  ].map(m => {
    const row: any = { ...m }
    playersHealth.forEach(p => {
      if (m.metric === "Sono") row[p.name] = (p.sleep.avg / 8) * 100
      if (m.metric === "Humor") row[p.name] = (p.mood.avg / 5) * 100
      if (m.metric === "Energia") row[p.name] = (p.mood.energy / 5) * 100
    })
    return row
  })

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Visao Geral</TabsTrigger>
          <TabsTrigger value="players">Por Jogador</TabsTrigger>
          <TabsTrigger value="comparison">Comparativo</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Team Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="stat-card border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Media de Sono (Equipe)</p>
                    <p className="text-2xl font-bold">{teamSleepAvg.toFixed(1)}h</p>
                    <p className="text-xs text-muted-foreground">Meta: 8h</p>
                  </div>
                  <div className="rounded-lg bg-chart-2/20 p-2">
                    <Moon className="h-5 w-5 text-chart-2" />
                  </div>
                </div>
                <Progress value={(teamSleepAvg / 8) * 100} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card className="stat-card border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Humor Medio (Equipe)</p>
                    <p className="text-2xl font-bold">{teamMoodAvg.toFixed(1)}/5</p>
                    <p className="text-xs text-muted-foreground">Bom</p>
                  </div>
                  <div className="rounded-lg bg-chart-4/20 p-2">
                    <Brain className="h-5 w-5 text-chart-4" />
                  </div>
                </div>
                <Progress value={(teamMoodAvg / 5) * 100} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card className="stat-card border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Jogadores com Alertas</p>
                    <p className="text-2xl font-bold">{playersWithAlerts.length}/{playersHealth.length}</p>
                    <p className="text-xs text-muted-foreground">Precisam de atencao</p>
                  </div>
                  <div className="rounded-lg bg-yellow-500/20 p-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Registros Hoje</p>
                    <p className="text-2xl font-bold">4/5</p>
                    <p className="text-xs text-muted-foreground">Jogadores atualizaram</p>
                  </div>
                  <div className="rounded-lg bg-green-500/20 p-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Weekly Chart */}
          <Card className="stat-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Evolucao Semanal da Equipe</CardTitle>
              <CardDescription>Media de sono, humor e energia dos jogadores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={teamWeeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.04 285)" />
                    <XAxis 
                      dataKey="day" 
                      stroke="oklch(0.65 0.02 285)" 
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="oklch(0.65 0.02 285)" 
                      fontSize={12}
                      tickLine={false}
                      domain={[0, 10]}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "oklch(0.18 0.03 285)",
                        border: "1px solid oklch(0.28 0.04 285)",
                        borderRadius: "0.5rem",
                      }}
                      labelStyle={{ color: "oklch(0.95 0.01 285)" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sleep"
                      name="Sono (h)"
                      stroke="oklch(0.55 0.18 300)"
                      strokeWidth={2}
                      dot={{ fill: "oklch(0.55 0.18 300)", strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      name="Humor"
                      stroke="oklch(0.6 0.16 320)"
                      strokeWidth={2}
                      dot={{ fill: "oklch(0.6 0.16 320)", strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      name="Energia"
                      stroke="oklch(0.7 0.15 270)"
                      strokeWidth={2}
                      dot={{ fill: "oklch(0.7 0.15 270)", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Player Overview */}
          <Card className="stat-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Status dos Jogadores</CardTitle>
                <CardDescription>Visao rapida da saude da equipe</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("players")}>
                Ver detalhes
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {playersHealth.map((player) => (
                  <div
                    key={player.id}
                    className="rounded-lg border border-border/50 bg-muted/30 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {player.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium">{player.name}</p>
                        <p className="text-xs text-muted-foreground">{player.position}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      {getStatusBadge(player.status)}
                    </div>
                    {player.alerts.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-yellow-500">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{player.alerts.length} alerta(s)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Players Tab */}
        <TabsContent value="players" className="space-y-6">
          {/* Date Selector and Comparison Mode */}
          <Card className="stat-card border-border/50">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Date Carousel */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Selecionar Data</span>
                    {isComparisonMode && (
                      <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/30">
                        <ArrowLeftRight className="h-3 w-3 mr-1" />
                        Modo Comparação
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto overflow-y-visible pb-2 pt-3 scrollbar-thin relative z-10">
                    {historicalDates.map((dateItem, index) => (
                      <button
                        key={dateItem.date}
                        onClick={() => {
                          if (isComparisonMode && selectedDate === dateItem.date) return
                          if (isComparisonMode) {
                            setComparisonDate(dateItem.date)
                          } else {
                            setSelectedDate(dateItem.date)
                          }
                        }}
                        className={`
                          relative flex flex-col items-center min-w-[72px] px-4 py-3 rounded-xl 
                          transition-all duration-200 ease-out border-2
                          ${selectedDate === dateItem.date 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : isComparisonMode && comparisonDate === dateItem.date
                              ? 'bg-chart-2/20 text-chart-2 border-chart-2/50'
                              : 'bg-muted/40 hover:bg-muted/70 border-transparent hover:border-border/50'
                          }
                        `}
                      >
                        <span className="text-xs opacity-70">{dateItem.label}</span>
                        <span className="text-lg font-bold">{dateItem.date.slice(-2)}</span>
                        {index === 0 && (
                          <span className="absolute -top-2 -right-2 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                            Hoje
                          </span>
                        )}
                        {isComparisonMode && selectedDate === dateItem.date && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                        {isComparisonMode && comparisonDate === dateItem.date && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-chart-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comparison Mode Toggle */}
                <div className="flex items-center gap-3 lg:border-l lg:border-border/50 lg:pl-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="comparison-mode"
                      checked={isComparisonMode}
                      onCheckedChange={setIsComparisonMode}
                    />
                    <label htmlFor="comparison-mode" className="text-sm font-medium cursor-pointer">
                      Comparar datas
                    </label>
                  </div>
                  {isComparisonMode && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-muted-foreground">
                          {historicalDates.find(d => d.date === selectedDate)?.label}
                        </span>
                      </div>
                      <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-chart-2" />
                        <span className="text-muted-foreground">
                          {historicalDates.find((d: any) => d.date === comparisonDate)?.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Player Cards */}
          <div className="grid gap-6">
            {playersHealth.map((player) => {
              const isExpanded = expandedPlayers.has(player.id)
              const currentData = getPlayerDataForDate(player.id, selectedDate)
              const compareData = isComparisonMode ? getPlayerDataForDate(player.id, comparisonDate) : null
              const trendData = getPlayerTrendData(player.id)

              return (
                <Card 
                  key={player.id} 
                  className={`
                    stat-card border-border/50 transition-all duration-300
                    ${isExpanded ? 'ring-2 ring-primary/30 shadow-lg' : ''}
                  `}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/20 text-primary text-lg">
                            {player.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{player.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Badge variant="outline">{player.position}</Badge>
                            <span>Ultima atualizacao: {player.lastUpdate}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentData && getStatusBadge(currentData.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePlayerExpanded(player.id)}
                          className="ml-2"
                        >
                          <History className="h-4 w-4 mr-1" />
                          Histórico
                          <ChevronDown 
                            className={`h-4 w-4 ml-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                          />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Main Metrics - Current Data or Comparison View */}
                    {isComparisonMode && currentData && compareData ? (
                      /* Comparison View */
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Left Column - Selected Date */}
                          <div className="space-y-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                            <div className="flex items-center gap-2 text-sm font-medium text-primary">
                              <span className="w-2 h-2 rounded-full bg-primary" />
                              {historicalDates.find((d: any) => d.date === selectedDate)?.fullLabel}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Sono</p>
                                <p className="text-xl font-bold">{currentData.sleep.avg}h</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Humor</p>
                                <p className="text-xl font-bold">{currentData.mood.avg}/5</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Calorias</p>
                                <p className="text-xl font-bold">{currentData.nutrition.calories}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Hidratação</p>
                                <p className="text-xl font-bold">{currentData.hydration.avg}L</p>
                              </div>
                            </div>
                          </div>

                          {/* Right Column - Comparison Date */}
                          <div className="space-y-4 p-4 rounded-xl bg-chart-2/5 border border-chart-2/20">
                            <div className="flex items-center gap-2 text-sm font-medium text-chart-2">
                              <span className="w-2 h-2 rounded-full bg-chart-2" />
                              {historicalDates.find((d: any) => d.date === comparisonDate)?.fullLabel}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Sono</p>
                                <p className="text-xl font-bold">{compareData.sleep.avg}h</p>
                                {(() => {
                                  const delta = calculateDelta(currentData.sleep.avg, compareData.sleep.avg)
                                  return delta.value !== 0 && (
                                    <span className={`text-xs ${delta.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                      {delta.isPositive ? '+' : ''}{delta.value}h
                                    </span>
                                  )
                                })()}
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Humor</p>
                                <p className="text-xl font-bold">{compareData.mood.avg}/5</p>
                                {(() => {
                                  const delta = calculateDelta(currentData.mood.avg, compareData.mood.avg)
                                  return delta.value !== 0 && (
                                    <span className={`text-xs ${delta.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                      {delta.isPositive ? '+' : ''}{delta.value}
                                    </span>
                                  )
                                })()}
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Calorias</p>
                                <p className="text-xl font-bold">{compareData.nutrition.calories}</p>
                                {(() => {
                                  const delta = calculateDelta(currentData.nutrition.calories, compareData.nutrition.calories)
                                  return delta.value !== 0 && (
                                    <span className={`text-xs ${delta.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                      {delta.isPositive ? '+' : ''}{delta.value} kcal
                                    </span>
                                  )
                                })()}
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Hidratação</p>
                                <p className="text-xl font-bold">{compareData.hydration.avg}L</p>
                                {(() => {
                                  const delta = calculateDelta(currentData.hydration.avg, compareData.hydration.avg)
                                  return delta.value !== 0 && (
                                    <span className={`text-xs ${delta.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                      {delta.isPositive ? '+' : ''}{delta.value}L
                                    </span>
                                  )
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : currentData ? (
                      /* Normal View */
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Sleep */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4 text-chart-2" />
                            <span className="text-sm font-medium">Sono</span>
                          </div>
                          <p className="text-2xl font-bold">{currentData.sleep.avg}h</p>
                          <Progress value={currentData.sleep.quality} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            qualidade: {currentData.sleep.quality}%
                          </p>
                        </div>

                        {/* Mood */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-chart-4" />
                            <span className="text-sm font-medium">Humor & Mental</span>
                          </div>
                          <p className="text-2xl font-bold">{currentData.mood.avg}/5</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Energia: {currentData.mood.energy}</span>
                            <span>Estresse: {currentData.mood.stress}</span>
                          </div>
                        </div>

                        {/* Nutrition */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Utensils className="h-4 w-4 text-chart-3" />
                            <span className="text-sm font-medium">Nutricao</span>
                          </div>
                          <p className="text-2xl font-bold">{currentData.nutrition.calories}</p>
                          <Progress value={(currentData.nutrition.calories / currentData.nutrition.target) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            Meta: {currentData.nutrition.target} kcal ({currentData.nutrition.adherence}% aderencia)
                          </p>
                        </div>

                        {/* Hydration */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-chart-1" />
                            <span className="text-sm font-medium">Hidratacao</span>
                          </div>
                          <p className="text-2xl font-bold">{currentData.hydration.avg}L</p>
                          <Progress value={(currentData.hydration.avg / currentData.hydration.target) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            Meta: {currentData.hydration.target}L
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Sem dados para a data selecionada
                      </div>
                    )}

                    {/* Alerts */}
                    {player.alerts.length > 0 && (
                      <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                        <div className="flex items-center gap-2 text-yellow-500">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Alertas</span>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {player.alerts.map((alert, i) => (
                            <li key={i} className="text-sm text-yellow-500/80">• {alert}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Expanded Historical Section */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-border/50 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2 mb-4">
                          <History className="h-4 w-4 text-primary" />
                          <span className="font-medium">Tendência dos Últimos 7 Dias</span>
                        </div>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.04 285)" />
                              <XAxis 
                                dataKey="date" 
                                stroke="oklch(0.65 0.02 285)" 
                                fontSize={12}
                                tickLine={false}
                              />
                              <YAxis 
                                stroke="oklch(0.65 0.02 285)" 
                                fontSize={12}
                                tickLine={false}
                                domain={[0, 'auto']}
                              />
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: "oklch(0.18 0.03 285)",
                                  border: "1px solid oklch(0.28 0.04 285)",
                                  borderRadius: "0.5rem",
                                }}
                                labelStyle={{ color: "oklch(0.95 0.01 285)" }}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="sono"
                                name="Sono (h)"
                                stroke="oklch(0.55 0.18 300)"
                                strokeWidth={2}
                                dot={{ fill: "oklch(0.55 0.18 300)", strokeWidth: 0 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="humor"
                                name="Humor"
                                stroke="oklch(0.6 0.16 320)"
                                strokeWidth={2}
                                dot={{ fill: "oklch(0.6 0.16 320)", strokeWidth: 0 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="energia"
                                name="Energia"
                                stroke="oklch(0.7 0.15 270)"
                                strokeWidth={2}
                                dot={{ fill: "oklch(0.7 0.15 270)", strokeWidth: 0 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="estresse"
                                name="Estresse"
                                stroke="oklch(0.65 0.20 25)"
                                strokeWidth={2}
                                dot={{ fill: "oklch(0.65 0.20 25)", strokeWidth: 0 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card className="stat-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Comparativo de Jogadores</CardTitle>
              <CardDescription>Visualize o desempenho de cada jogador em diferentes metricas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={playerRadarData}>
                    <PolarGrid stroke="oklch(0.28 0.04 285)" />
                    <PolarAngleAxis dataKey="metric" stroke="oklch(0.65 0.02 285)" fontSize={12} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="oklch(0.65 0.02 285)" fontSize={10} />
                    <Radar
                      name="ThunderStrike"
                      dataKey="ThunderStrike"
                      stroke="oklch(0.6 0.16 320)"
                      fill="oklch(0.6 0.16 320)"
                      fillOpacity={0.1}
                    />
                    <Radar
                      name="ShadowTop"
                      dataKey="ShadowTop"
                      stroke="oklch(0.7 0.15 50)"
                      fill="oklch(0.7 0.15 50)"
                      fillOpacity={0.1}
                    />
                    <Radar
                      name="JungleKing"
                      dataKey="JungleKing"
                      stroke="oklch(0.65 0.18 150)"
                      fill="oklch(0.65 0.18 150)"
                      fillOpacity={0.1}
                    />
                    <Radar
                      name="ADCarry"
                      dataKey="ADCarry"
                      stroke="oklch(0.55 0.18 300)"
                      fill="oklch(0.55 0.18 300)"
                      fillOpacity={0.1}
                    />
                    <Radar
                      name="SupportMaster"
                      dataKey="SupportMaster"
                      stroke="oklch(0.7 0.15 270)"
                      fill="oklch(0.7 0.15 270)"
                      fillOpacity={0.1}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar comparison */}
          <Card className="stat-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Media de Sono por Jogador</CardTitle>
              <CardDescription>Comparacao das horas de sono na ultima semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={playersHealth.map(p => ({ name: p.name, sono: p.sleep.avg, meta: 8 }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.04 285)" />
                    <XAxis dataKey="name" stroke="oklch(0.65 0.02 285)" fontSize={12} tickLine={false} />
                    <YAxis stroke="oklch(0.65 0.02 285)" fontSize={12} tickLine={false} domain={[0, 10]} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "oklch(0.18 0.03 285)",
                        border: "1px solid oklch(0.28 0.04 285)",
                        borderRadius: "0.5rem",
                      }}
                      labelStyle={{ color: "oklch(0.95 0.01 285)" }}
                    />
                    <Bar dataKey="sono" name="Horas de sono" fill="oklch(0.55 0.18 300)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="meta" name="Meta" fill="oklch(0.28 0.04 285)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card className="stat-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Alertas da Equipe
              </CardTitle>
              <CardDescription>Jogadores que precisam de atencao</CardDescription>
            </CardHeader>
            <CardContent>
              {playersWithAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <p className="mt-4 text-lg font-medium">Nenhum alerta no momento</p>
                  <p className="text-muted-foreground">Todos os jogadores estao com indicadores saudaveis</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {playersWithAlerts.map((player) => (
                    <div
                      key={player.id}
                      className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-yellow-500/20 text-yellow-500">
                              {player.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-sm text-muted-foreground">{player.position}</p>
                          </div>
                        </div>
                        {getStatusBadge(player.status)}
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium text-yellow-500">Problemas identificados:</p>
                        <ul className="mt-2 space-y-2">
                          {player.alerts.map((alert, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              <span>{alert}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">
                          Ver historico
                        </Button>
                        <Button size="sm">
                          Contatar jogador
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
