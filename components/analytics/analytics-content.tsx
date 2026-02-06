"use client";

import React from "react"
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Target,
  Zap,
  Shield,
  Swords,
  Eye,
  BarChart3,
  Users,
  Loader2,
  Info,
} from "lucide-react";
import { PageNav, type PageNavTab } from "@/components/ui/page-nav";
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@/lib/auth-context"
import { Id } from "@/convex/_generated/dataModel"

const analyticsTabs: PageNavTab[] = [
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "synergy", label: "Sinergia", icon: Users },
];

export function AnalyticsContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<string>("performance");

  const teamPerf = useQuery(api.analytics.getTeamPerformance, user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip")
  const playerStats = useQuery(api.analytics.getPlayerStats, user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip")

  if (!teamPerf || !playerStats) return <div className="flex h-60 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      <PageNav tabs={analyticsTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Win Rate do Time"
          value={`${teamPerf.winRate}%`}
          description={`${teamPerf.wins} vitorias em ${teamPerf.totalGames} jogos`}
          icon={Target}
        />
        <StatCard
          title="Jogadores Ativos"
          value={playerStats.length.toString()}
          description="Acompanhamento em tempo real"
          icon={Users}
        />
        <StatCard
          title="Tempo Medio (Est.)"
          value={teamPerf.averageDuration}
          description="Calculado via histórico de partidas"
          icon={Zap}
        />
        <StatCard
          title="Objetivos"
          value={`${teamPerf.objectives.find(o => o.name === "First Blood")?.rate || 0}%`}
          description="Taxa de First Blood (FB)"
          icon={Shield}
        />
      </div>

      {activeTab === "performance" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Performance ao Longo do Tempo</CardTitle>
                <CardDescription>Rating medio derivado da performance em treinos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={teamPerf.performanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                      <XAxis dataKey="week" tick={{ fill: "#ffffff60", fontSize: 10 }} axisLine={false} />
                      <YAxis domain={[0, 10]} tick={{ fill: "#ffffff60", fontSize: 10 }} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Line type="monotone" dataKey="rating" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Controle de Objetivos</CardTitle>
                <CardDescription>Taxa de sucesso por objetivo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamPerf.objectives.map((obj) => (
                  <div key={obj.name} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>{obj.name}</span>
                      <span className="font-bold text-primary">{obj.rate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${obj.rate}%` }} />
                    </div>
                  </div>
                ))}
                {teamPerf.objectives.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-10">Sem dados de objetivos registrados</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Estatisticas por Jogador</CardTitle>
              <CardDescription>Medias baseadas nos ultimos 10 jogos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-3 px-4 text-muted-foreground font-medium">Jogador</th>
                      <th className="py-3 px-4 text-muted-foreground font-medium">Papel</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium">KDA</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium">CS/min</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium">Sinc. Global</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerStats.map((player) => (
                      <tr key={player.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="py-3 px-4 font-bold">{player.name}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{player.role}</Badge>
                        </td>
                        <td className="text-center py-3 px-4 font-mono text-primary font-bold">{player.kda}</td>
                        <td className="text-center py-3 px-4">{player.cs}</td>
                        <td className="text-center py-3 px-4">{player.winRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "synergy" && (
        <div className="flex flex-col items-center justify-center h-60 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01] opacity-50">
          <Users className="h-10 w-10 mb-2 text-primary/40" />
          <p className="font-bold uppercase tracking-widest text-[10px]">Analise de Duplas em Processamento</p>
          <p className="text-[10px] text-muted-foreground mt-1">Os dados de sinergia requerem um volume maior de jogos registrados.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, description }: {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{title}</p>
            <p className="text-2xl font-black text-white">{value}</p>
          </div>
          <div className="p-2 rounded-lg bg-primary/20">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </div>
        <p className="text-[10px] font-medium text-white/40 mt-3 pt-2 border-t border-white/5">{description}</p>
      </CardContent>
    </Card>
  );
}
