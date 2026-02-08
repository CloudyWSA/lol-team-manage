"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Zap, 
  Info,
  Target,
  Shield,
  Swords,
  Eye
} from "lucide-react";
import { PageNav, type PageNavTab } from "@/components/ui/page-nav";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const analyticsTabs: PageNavTab[] = [
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "advanced", label: "Analise Profunda", icon: BarChart3 },
];

export function AnalyticsContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<string>("performance");
  const teamPerf = useQuery(api.analytics.getTeamPerformance, user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip")
  const playerStats = useQuery(api.analytics.getPlayerStats, user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip")
  const advancedStats = useQuery(api.analytics.getAdvancedStats, user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip")

  if (!teamPerf || !playerStats) return <div className="flex h-60 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageNav tabs={analyticsTabs} activeTab={activeTab} onTabChange={setActiveTab} className="w-auto" />
      </div>

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
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                      <XAxis 
                        dataKey="week" 
                        tick={{ fill: "#ffffff90", fontSize: 10, fontWeight: 'bold' }} 
                        axisLine={false} 
                      />
                      <YAxis 
                        domain={[0, 10]} 
                        tick={{ fill: "#ffffff90", fontSize: 10, fontWeight: 'bold' }} 
                        axisLine={false} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: '8px' }}
                        itemStyle={{ color: "#fff", fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rating" 
                        stroke="#3b82f6" 
                        strokeWidth={4} 
                        dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 8, strokeWidth: 0 }}
                      />
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

      {activeTab === "advanced" && advancedStats && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <CardTitle className="text-base text-white">Heatmap de Correlação (Pearson)</CardTitle>
                </div>
                <CardDescription>Interdependência entre métricas chaves do time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto pb-4">
                  <div className="min-w-[400px]">
                    <div className="flex">
                      <div className="w-20" />
                      <div className="flex-1 grid grid-cols-6 mb-2">
                        {advancedStats.correlationMatrix?.[0]?.correlations.map((c: any) => (
                          <div key={c.metric} className="text-[8px] font-bold text-white/40 text-center uppercase truncate px-1">
                            {c.metric}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {advancedStats.correlationMatrix?.map((row: any) => (
                      <div key={row.metric} className="flex items-center mb-1">
                        <div className="w-20 text-[8px] font-bold text-white/40 uppercase pr-2 text-right truncate">
                          {row.metric}
                        </div>
                        <div className="flex-1 grid grid-cols-6 gap-1">
                          {row.correlations.map((cell: any) => (
                            <div 
                              key={cell.metric} 
                              className="aspect-square rounded-sm flex items-center justify-center text-[8px] font-bold border border-white/5"
                              style={{ 
                                backgroundColor: getHeatmapColor(cell.value),
                                color: Math.abs(cell.value) > 0.4 ? 'white' : 'rgba(255,255,255,0.6)'
                              }}
                              title={`${row.metric} vs ${cell.metric}: ${cell.value}`}
                            >
                              {cell.value}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[8px] font-bold text-white/40 uppercase tracking-widest px-1">
                  <span className="text-rose-500">-1.0 (Inversa)</span>
                  <div className="h-1 flex-1 mx-4 rounded-full bg-gradient-to-r from-rose-500 via-white/20 to-emerald-500" />
                  <span className="text-emerald-500">+1.0 (Direta)</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-400" />
                  <CardTitle className="text-base text-white">Consistência de Performance</CardTitle>
                </div>
                <CardDescription>Comparativo de medianas (Vitórias vs Derrotas)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-1">Micro Stats (KDA, CS)</p>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={advancedStats.boxplots.filter((b: any) => !['DAMAGEDEALT', 'GOLDEARNED'].includes(b.metric))} layout="vertical">
                        <defs>
                          <linearGradient id="winGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#34d399" stopOpacity={1}/>
                          </linearGradient>
                          <linearGradient id="lossGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#f87171" stopOpacity={1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={true} />
                        <XAxis type="number" tick={{ fill: "#ffffff90", fontSize: 10 }} />
                        <YAxis dataKey="metric" type="category" tick={{ fill: "#ffffff", fontSize: 10, fontWeight: 'bold' }} width={80} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: '8px' }} />
                        <Bar name="Vitória" dataKey="win.median" fill="url(#winGradient)" radius={[0, 4, 4, 0]} />
                        <Bar name="Derrota" dataKey="loss.median" fill="url(#lossGradient)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-1">Macro Stats (Dano, Ouro)</p>
                  <div className="h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={advancedStats.boxplots.filter((b: any) => ['DAMAGEDEALT', 'GOLDEARNED'].includes(b.metric))} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={true} />
                        <XAxis type="number" tick={{ fill: "#ffffff90", fontSize: 10 }} />
                        <YAxis dataKey="metric" type="category" tick={{ fill: "#ffffff", fontSize: 10, fontWeight: 'bold' }} width={80} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: '8px' }} />
                        <Bar name="Vitória" dataKey="win.median" fill="url(#winGradient)" radius={[0, 4, 4, 0]} />
                        <Bar name="Derrota" dataKey="loss.median" fill="url(#lossGradient)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card border-border border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-500/5 to-transparent">
               <CardContent className="pt-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Taxa de Conversão Ouro/Dano</p>
                  <p className="text-2xl font-black text-white">{advancedStats.efficiency}</p>
                  <p className="text-[10px] text-amber-500/60 mt-2 italic font-medium">Correlação de eficiência recursos/impacto.</p>
               </CardContent>
            </Card>

            {advancedStats.momentum?.map((m: any, idx: number) => (
              <Card key={m.objective} className={`bg-card border-border border-l-4 ${idx === 0 ? 'border-l-blue-500 bg-gradient-to-br from-blue-500/5' : 'border-l-indigo-500 bg-gradient-to-br from-indigo-500/5'} to-transparent`}>
                <CardContent className="pt-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Win Rate após {m.objective}</p>
                  <p className="text-2xl font-black text-white">{m.winRate}%</p>
                  <p className="text-[10px] text-blue-400/60 mt-2 italic font-medium">Probabilidade condicional de vitória.</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap className="h-32 w-32 text-primary" strokeWidth={1} />
            </div>
            <CardContent className="p-8 h-full flex flex-col justify-center relative z-10">
              <div className="flex gap-5">
                <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 shadow-2xl shadow-primary/20 border border-primary/20">
                  <Zap className="h-7 w-7 text-primary" fill="currentColor" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white mb-3 uppercase tracking-widest inline-block border-b-2 border-primary/30 pb-1">Interpretando os Dados</h4>
                  <p className="text-xs text-white/60 leading-relaxed font-medium">
                    O <strong>Heatmap</strong> revela o DNA tático: correlações em <span className="text-emerald-400 font-bold">Verde</span> indicam crescimento mútuo de métricas, enquanto em <span className="text-rose-400 font-bold">Vermelho</span> indicam oposição (ex: Mortes vs Vitória). A divisão de escalas nas medianas permite analisar métricas de combate e economia simultaneamente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Helper colors for heatmap - Green/White/Red
function getHeatmapColor(val: number) {
  if (val >= 0.8) return 'rgba(16, 185, 129, 0.9)'; // Emerald 500
  if (val >= 0.5) return 'rgba(16, 185, 129, 0.6)'; // Emerald 500
  if (val >= 0.2) return 'rgba(16, 185, 129, 0.3)'; // Emerald 500
  if (val <= -0.8) return 'rgba(239, 68, 68, 0.9)'; // Red 500
  if (val <= -0.5) return 'rgba(239, 68, 68, 0.6)'; // Red 500
  if (val <= -0.2) return 'rgba(239, 68, 68, 0.3)'; // Red 500
  return 'rgba(255, 255, 255, 0.05)'; // Neutral/White
}

function StatCard({ title, value, icon: Icon, description }: {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <Card className="bg-card border-border hover:border-primary/40 transition-all group overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-4 relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/50 transition-colors mb-1">{title}</p>
            <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors border border-primary/10">
            <Icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <p className="text-[10px] font-bold text-white/20 group-hover:text-white/40 transition-colors mt-3 pt-2 border-t border-white/5">{description}</p>
      </CardContent>
    </Card>
  );
}
