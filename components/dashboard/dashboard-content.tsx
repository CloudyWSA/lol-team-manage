"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Moon,
  Utensils,
  Brain,
  Clock,
  Swords,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Dna,
  Trophy,
  ChevronRight,
  Activity,
  CheckSquare,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

export function DashboardContent() {
  const { user, isStaff } = useAuth()

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Bem-vindo, {user.name}</h1>
          <p className="text-muted-foreground font-medium">
            {isStaff 
              ? "Visão geral da performance e saúde do time"
              : "Visão geral do seu dia e bem-estar"}
          </p>
        </div>
      </div>

      {isStaff ? <CoachDashboard /> : <PlayerDashboard />}
    </div>
  )
}

function PlayerDashboard() {
  const { user } = useAuth()
  const data = useQuery(api.dashboard.getPlayerDashboardData, 
    user ? { userId: user.id as Id<"users">, teamId: user.teamId as Id<"teams"> } : "skip"
  )

  if (!data) return <div className="flex h-60 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  const { appointment, health, nextEvents, recentMatches } = data

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickStatCard
          title="Próxima Consulta"
          value={appointment ? `${appointment.date}, ${appointment.time}` : "Nenhuma agendada"}
          subtitle={appointment ? `${appointment.professional} - ${appointment.type}` : "Verifique sua agenda"}
          icon={Brain}
          iconColor="text-chart-4"
        />
        <QuickStatCard
          title="Sono (Última Noite)"
          value={health?.sleep ? `${health.sleep.hours}h` : "--"}
          subtitle={health?.sleep ? `Qualidade: ${health.sleep.quality}%` : "Sem registro"}
          icon={Moon}
          iconColor="text-chart-2"
        />
        <QuickStatCard
          title="Próximas Atividades"
          value={nextEvents?.[0]?.startTime || "--"}
          subtitle={nextEvents?.[0]?.title || "Sem eventos"}
          icon={Swords}
          iconColor="text-chart-1"
        />
        <QuickStatCard
          title="Hidratação Hoje"
          value={health?.hydration ? `${health.hydration}L` : "0L"}
          subtitle="Meta: 3.0L"
          icon={Activity}
          iconColor="text-chart-5"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Health Summary */}
          <Card className="stat-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Resumo de Saúde</CardTitle>
                <CardDescription>Acompanhamento do seu bem-estar</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/my-health">
                  Ver detalhes
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/10"><Moon className="h-4 w-4 text-chart-2" /></div>
                    <span className="text-sm font-medium">Sono</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{health?.sleep?.hours || 0}</span>
                      <span className="text-sm text-muted-foreground">h</span>
                    </div>
                    <Progress value={health?.sleep?.quality || 0} className="h-2" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-3/10"><Utensils className="h-4 w-4 text-chart-3" /></div>
                    <span className="text-sm font-medium">Hidratação</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{health?.hydration || 0}</span>
                      <span className="text-sm text-muted-foreground">L</span>
                    </div>
                    <Progress value={((health?.hydration || 0) / 3) * 100} className="h-2" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-4/10"><Brain className="h-4 w-4 text-chart-4" /></div>
                    <span className="text-sm font-medium">Humor</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{health?.mood?.score || 0}</span>
                      <span className="text-sm text-muted-foreground">/ 5</span>
                    </div>
                    <Progress value={((health?.mood?.score || 0) / 5) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Desempenho Recente</CardTitle>
                <CardDescription>Últimas partidas oficiais</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/matches">
                  Ver todas
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMatches.map((match) => (
                  <div key={match._id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold ${match.won ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                        {match.won ? "W" : "L"}
                      </div>
                      <div>
                        <p className="font-medium">vs. {match.opponent}</p>
                        <p className="text-sm text-muted-foreground">{match.stage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{match.result || "--"}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{match.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <UpcomingEventsCard events={nextEvents} />
          <QuickActionsCard />
        </div>
      </div>
    </div>
  )
}

function CoachDashboard() {
  const { user } = useAuth()
  const data = useQuery(api.dashboard.getCoachDashboardData, 
    user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip"
  )

  if (!data) return <div className="flex h-60 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  const { alerts, tasks, playerStats } = data

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-6 lg:col-span-1">
          <Card className="stat-card border-border/50 bg-muted/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                CENTRAL DE ALERTAS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert._id} className="p-2.5 rounded-lg border border-border/50 bg-background/50 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Alert</span>
                    <Badge variant="outline" className={`text-[9px] h-4 px-1 leading-none uppercase font-black ${
                      alert.severity === 'alto' ? 'border-red-500/50 text-red-500 bg-red-500/5' : 'border-blue-500/50 text-blue-500'
                    }`}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium">{alert.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="stat-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider"><CheckSquare className="h-4 w-4" /> Tarefas Staff</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.map((task) => (
                <div key={task._id} className="flex items-start gap-3 p-2 rounded-md border border-transparent hover:border-border/50 transition-colors">
                  <div className={`mt-1 h-3 w-3 rounded-sm border-2 ${task.priority === 'Alta' ? 'border-red-500/50' : 'border-blue-500/50'}`} />
                  <div>
                    <p className="text-xs font-semibold">{task.title}</p>
                    <p className="text-[10px] text-muted-foreground">{task.deadline}</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-xs h-8 border border-dashed border-border/50" asChild>
                <Link href="/staff/tasks"><Plus className="h-3 w-3 mr-1" /> NOVA TAREFA</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <Card className="stat-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Squad Performance</CardTitle>
              <CardDescription>Métricas em tempo real do time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="py-3 text-[10px] font-black uppercase text-muted-foreground px-2">Player</th>
                      <th className="py-3 text-[10px] font-black uppercase text-muted-foreground">Rank / LP</th>
                      <th className="py-3 text-[10px] font-black uppercase text-muted-foreground text-center">LP Delta</th>
                      <th className="py-3 text-[10px] font-black uppercase text-muted-foreground text-right px-2">Winrate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {playerStats.map((p: any) => (
                      <tr key={p._id} className="group hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground w-8">{p.position}</span>
                            <span className="text-sm font-bold underline decoration-primary/30">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-3 font-mono text-xs">{p.riotAccount?.rank} / {p.riotAccount?.lp} LP</td>
                        <td className="py-3 text-center">
                          <span className={`font-mono text-xs font-bold ${p.riotAccount?.lpDelta > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {p.riotAccount?.lpDelta > 0 ? "+" : ""}{p.riotAccount?.lpDelta}
                          </span>
                        </td>
                        <td className="py-3 text-right px-2 font-mono text-xs">{p.riotAccount?.winRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="stat-card border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-bold flex items-center gap-2"><Dna className="h-4 w-4 text-primary" /> Squad Readiness</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {playerStats.slice(0, 3).map((p: any) => (
                  <div key={p._id} className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-muted/10">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{p.name.charAt(0)}</div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold">{p.name}</span>
                        <span className="text-[9px] text-muted-foreground">{p.position}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-muted-foreground leading-none uppercase">Sono</p>
                      <p className="text-[11px] font-mono font-bold">{p.lastHealth?.sleep?.hours || "--"}h</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <UpcomingEventsCard events={[]} /> 
          </div>
        </div>
      </div>
    </div>
  )
}

function UpcomingEventsCard({ events = [] }: { events?: any[] }) {
  const getIcon = (type: string) => {
    if (type === "Treino") return Swords
    if (type === "Review") return Brain
    return Trophy
  }

  return (
    <Card className="stat-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Agenda</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Próximos compromissos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.length > 0 ? events.map((event) => (
            <div key={event._id} className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                {React.createElement(getIcon(event.type), { className: "h-5 w-5 text-primary" })}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-tight">{event.title}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] font-mono">{event.date}</Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{event.startTime}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center h-40 opacity-20"><Calendar className="h-10 w-10 mb-2" /><p className="text-xs uppercase font-black">Agenda Vazia</p></div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionsCard() {
  return (
    <Card className="stat-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        <CardDescription>Registre suas informações</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
          <Link href="/my-health?tab=food"><Utensils className="mr-2 h-4 w-4 text-chart-3" /> Registrar Refeição</Link>
        </Button>
        <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
          <Link href="/my-health?tab=sleep"><Moon className="mr-2 h-4 w-4 text-chart-2" /> Registrar Sono</Link>
        </Button>
        <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
          <Link href="/my-health?tab=mood"><Brain className="mr-2 h-4 w-4 text-chart-4" /> Registrar Humor</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

interface QuickStatCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  iconColor: string
}

function QuickStatCard({ title, value, subtitle, icon: Icon, iconColor }: QuickStatCardProps) {
  return (
    <Card className="stat-card border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
