"use client"

import React, { useState, useEffect, useRef } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Line
} from "recharts"
import {
  Skull,
  Shield,
  Zap,
  Ghost,
  Target,
  Clock,
  Map as MapIcon,
  TrendingUp,
  Activity,
  BarChart2,
  Swords,
  Timer,
  ZapIcon,
  EyeIcon,
  ScatterChart as ScatterChartIcon
} from "lucide-react"
import { ScatterChart, Scatter, ZAxis } from "recharts"
import { Role, PlayerStats, MatchStatisticsData } from "./match-stats-types"
import { getChampionIcon } from "@/lib/riot-assets"

// Riot API Map Constants
const RIOT_MAP_SIZE = 15000;





export function MatchAnalyticalTabs({ stats }: { stats: MatchStatisticsData | null }) {
  const [activeAnalysis, setActiveAnalysis] = useState("stats")

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl opacity-50 bg-muted/5">
        <BarChart2 className="h-10 w-10 mb-2 text-muted-foreground" />
        <p className="font-bold">Análise Avançada Indisponível</p>
        <p className="text-xs text-muted-foreground">Sincronize a partida para visualizar os dados detalhados.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Badge 
          className={`cursor-pointer px-4 py-2 transition-all ${activeAnalysis === "stats" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted hover:bg-muted/80 text-muted-foreground"}`}
          onClick={() => setActiveAnalysis("stats")}
        >
          <BarChart2 className="h-3 w-3 mr-2" />
          Estatísticas
        </Badge>
        <Badge 
          className={`cursor-pointer px-4 py-2 transition-all ${activeAnalysis === "momentum" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted hover:bg-muted/80 text-muted-foreground"}`}
          onClick={() => setActiveAnalysis("momentum")}
        >
          <TrendingUp className="h-3 w-3 mr-2" />
          Momentum & Recursos
        </Badge>
        {/* Heatmap disabled for now as we need event data */}
        {/* <Badge 
          className={`cursor-pointer px-4 py-2 transition-all ${activeAnalysis === "heatmap" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted hover:bg-muted/80 text-muted-foreground"}`}
          onClick={() => setActiveAnalysis("heatmap")}
        >
          <Activity className="h-3 w-3 mr-2" />
          Mapa de Calor
        </Badge> */}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeAnalysis === "stats" && <StatisticsView stats={stats} />}
        {activeAnalysis === "momentum" && <MomentumView stats={stats} />}
        {/* {activeAnalysis === "heatmap" && <HeatmapView />} */}
      </div>
    </div>
  )
}

function MomentumView({ stats }: { stats: MatchStatisticsData }) {
  // Identify momentum swings (gold diff changes > 2000 between snapshots)
  const swings = stats.timeline.slice(1).map((curr, i) => {
    const prev = stats.timeline[i]
    const delta = Math.abs(curr.goldDiff - prev.goldDiff)
    if (delta > 1500) {
      return { 
        start: prev.minute, 
        end: curr.minute, 
        delta, 
        leadingTeam: curr.goldDiff > prev.goldDiff ? 'blue' : 'red' 
      }
    }
    return null
  }).filter(Boolean)

  return (
    <div className="grid gap-6">
      <Card className="stat-card border-border/50 bg-background/50 backdrop-blur-md overflow-hidden ring-1 ring-white/5">
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-primary to-purple-600 opacity-60" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Momentum Dinâmico & Probabilidade
              </CardTitle>
              <CardDescription>Win Probability (P_win) vs. Diferença de Recursos</CardDescription>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="h-0.5 w-6 bg-primary" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Gold Diff</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="h-0.5 w-6 border-t-2 border-dashed border-purple-500" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Win Prob</span>
               </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full relative">
            {/* Legend for Events */}
            <div className="absolute top-0 right-0 flex flex-col gap-2 z-20">
              {swings.map((s, i) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${s?.leadingTeam === 'blue' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  <Zap className="h-3 w-3" />
                  Swing: +{s?.delta}g ({s?.start}'-{s?.end}')
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.timeline} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="minute" 
                  stroke="#ffffff20" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  unit="m"
                />
                <YAxis 
                   yAxisId="gold"
                   stroke="#ffffff20" 
                   fontSize={10} 
                   tickLine={false} axisLine={false} 
                   tickFormatter={(value) => `${value > 0 ? "+" : ""}${value / 1000}k`}
                />
                <YAxis 
                   yAxisId="prob"
                   orientation="right"
                   stroke="#a855f7" 
                   fontSize={10} 
                   tickLine={false} axisLine={false} 
                   domain={[0, 1]}
                   tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-slate-950/95 border border-white/10 p-4 rounded-xl backdrop-blur-xl shadow-2xl min-w-[200px]">
                           <div className="flex justify-between items-center mb-3">
                              <span className="text-[12px] font-black text-primary">{label}' MINUTOS</span>
                              <Badge variant="outline" className="text-[9px] border-purple-500/50 text-purple-400">P_win: {(data.winProb*100).toFixed(1)}%</Badge>
                           </div>
                           <div className="space-y-2">
                             <div className="flex justify-between">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Gold Diff</span>
                                <span className={`text-[10px] font-black ${data.goldDiff > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                  {data.goldDiff > 0 ? '+' : ''}{data.goldDiff}
                                </span>
                             </div>
                             {data.events.length > 0 && (
                               <div className="pt-2 border-t border-white/5 space-y-1">
                                 {data.events.map((e: any, i: number) => (
                                   <div key={i} className="flex items-start gap-2">
                                      <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${e.team === 'blue' ? 'bg-blue-500' : 'bg-red-500'}`} />
                                      <span className="text-[9px] text-white leading-tight font-medium italic">{e.description}</span>
                                   </div>
                                 ))}
                               </div>
                             )}
                           </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                {/* Gold Difference Area */}
                <Area 
                  yAxisId="gold"
                  type="monotone" 
                  dataKey="goldDiff" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorGold)" 
                  animationDuration={1500}
                />
                {/* Win Probability Line */}
                <Line
                  yAxisId="prob"
                  type="monotone"
                  dataKey="winProb"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#a855f7', strokeWidth: 2, stroke: '#1e1b4b' }}
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Resource Velocity */}
        <Card className="stat-card border-border/50 bg-background/50 backdrop-blur-md ring-1 ring-white/5 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="h-4 w-4 text-blue-400" />
              Velocidade de Recurso
            </CardTitle>
            <CardDescription>Gold per Minute (GPM) agregado por equipe</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.efficiency.resourceVelocity}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                   <XAxis dataKey="minute" hide />
                   <YAxis fontSize={8} stroke="#ffffff20" axisLine={false} tickLine={false} />
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10' }}
                      itemStyle={{ fontSize: '10px' }}
                   />
                   <Area type="monotone" dataKey="blue" stroke="#3b82f6" fill="#3b82f620" />
                   <Area type="monotone" dataKey="red" stroke="#ef4444" fill="#ef444420" />
                </AreaChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Efficiency */}
        <Card className="stat-card border-border/50 bg-background/50 backdrop-blur-md ring-1 ring-white/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-500" />
              Eficiência de Conversão
            </CardTitle>
            <CardDescription>Objetivos conquistados por 1k de vantagem</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
             <div className="space-y-6">
               <div className="space-y-2">
                 <div className="flex justify-between text-xs font-black tracking-widest uppercase">
                   <span className="text-blue-400">Invokers</span>
                   <span className="text-white">{(stats.efficiency.conversionRatio.blue * 100).toFixed(0)}%</span>
                 </div>
                 <div className="h-3 w-full bg-blue-500/10 rounded-full overflow-hidden border border-blue-500/20">
                    <div 
                      className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000" 
                      style={{ width: `${stats.efficiency.conversionRatio.blue * 100}%` }}
                    />
                 </div>
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between text-xs font-black tracking-widest uppercase">
                   <span className="text-red-400">RED Canids</span>
                   <span className="text-white">{(stats.efficiency.conversionRatio.red * 100).toFixed(0)}%</span>
                 </div>
                 <div className="h-3 w-full bg-red-500/10 rounded-full overflow-hidden border border-red-500/20">
                    <div 
                      className="h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-1000" 
                      style={{ width: `${stats.efficiency.conversionRatio.red * 100}%` }}
                    />
                 </div>
               </div>
               <p className="text-[10px] text-muted-foreground leading-relaxed italic text-center pt-4 border-t border-white/5">
                 Uma taxa alta indica que a equipe sabe punir erros e converter vantagens econômicas em controle de mapa.
               </p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatisticsView({ stats }: { stats: MatchStatisticsData }) {
  const [laneTime, setLaneTime] = useState<"10" | "15">("10")

  return (
    <div className="grid gap-6">
      <Card className="stat-card border-border/50 bg-background/30 backdrop-blur-sm overflow-hidden ring-1 ring-white/5">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/5 pb-4">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
                <Swords className="h-5 w-5 text-primary" />
             </div>
             <div>
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Laning Phase Matrix</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Dominância Tática - H2H Analysis</CardDescription>
             </div>
          </div>
          <div className="flex bg-muted/20 p-1 rounded-md border border-border/50">
            {["10", "15"].map((time) => (
              <button 
                key={time}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded transition-all ${laneTime === time ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-white"}`}
                onClick={() => setLaneTime(time as any)}
              >
                {time}M
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-[1fr_200px_1fr] border-b border-border/40 bg-muted/10">
            <div className="px-6 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-blue-400/80">Invokers Unit</div>
            <div className="px-4 py-2 text-center text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground border-x border-border/40">Delta Metrics</div>
            <div className="px-6 py-2 text-right text-[9px] font-black uppercase tracking-[0.2em] text-red-400/80">RED Canids Unit</div>
          </div>
          <div className="divide-y divide-border/20">
            {stats.players.blue.map((bluePlayer, idx) => {
              const redPlayer = stats.players.red[idx]
              const diff = laneTime === "10" ? bluePlayer.at10 : bluePlayer.at15
              const isBlueLeading = diff.goldDiff > 0
              
              return (
                <div key={bluePlayer.role} className="grid grid-cols-[1fr_200px_1fr] items-center hover:bg-white/[0.02] transition-colors group">
                  {/* Blue Unit */}
                  <div className="flex items-center gap-4 px-6 py-4">
                    <div className="relative h-12 w-12 rounded bg-muted border border-border/50 overflow-hidden flex-shrink-0">
                      <img 
                        src={getChampionIcon(bluePlayer.champion, "14.1.1")} 
                        alt={bluePlayer.champion}
                        className={`object-cover transition-all duration-500 ${isBlueLeading ? 'opacity-100' : 'opacity-40 grayscale'}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-black truncate ${isBlueLeading ? 'text-blue-400' : 'text-foreground/60'}`}>{bluePlayer.name}</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{bluePlayer.champion}</p>
                    </div>
                  </div>

                  {/* Tactical Delta */}
                  <div className="px-4 py-4 border-x border-border/20 h-full flex flex-col justify-center gap-3 bg-muted/5 relative">
                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">
                      <span>{bluePlayer.role}</span>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Gold Visualizer */}
                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-white/5 rounded-full relative overflow-hidden ring-1 ring-white/5">
                           <div 
                              className={`absolute top-0 bottom-0 transition-all duration-1000 ${isBlueLeading ? 'bg-blue-500 right-1/2' : 'bg-red-500 left-1/2'}`}
                              style={{ 
                                width: `${Math.min(Math.abs(diff.goldDiff / 2000) * 50, 50)}%`,
                              }}
                           />
                           <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20 z-10" />
                        </div>
                        <div className="flex justify-center">
                          <span className={`text-[10px] font-mono font-black ${diff.goldDiff > 0 ? 'text-blue-400' : diff.goldDiff < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                            {diff.goldDiff > 0 ? '+' : ''}{diff.goldDiff}G
                          </span>
                        </div>
                      </div>

                      {/* CS / XP Secondary Deltas */}
                      <div className="flex justify-between items-center px-1">
                         <div className="flex flex-col items-center">
                            <span className="text-[7px] text-muted-foreground font-black uppercase tracking-tighter">CS Delta</span>
                            <span className={`text-[9px] font-mono font-black ${diff.csDiff > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                              {diff.csDiff > 0 ? '+' : ''}{diff.csDiff}
                            </span>
                         </div>
                         <div className="flex flex-col items-center">
                            <span className="text-[7px] text-muted-foreground font-black uppercase tracking-tighter">XP Delta</span>
                            <span className={`text-[9px] font-mono font-black ${diff.xpDiff > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                              {diff.xpDiff > 0 ? '+' : ''}{diff.xpDiff}
                            </span>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Red Unit */}
                  <div className="flex items-center gap-4 px-6 py-4 justify-end text-right">
                    <div className="min-w-0">
                      <p className={`text-xs font-black truncate ${!isBlueLeading && diff.goldDiff !== 0 ? 'text-red-400' : 'text-foreground/60'}`}>{redPlayer.name}</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{redPlayer.champion}</p>
                    </div>
                    <div className="relative h-12 w-12 rounded bg-muted border border-border/50 overflow-hidden flex-shrink-0">
                      <img 
                        src={getChampionIcon(redPlayer.champion, "14.1.1")} 
                        alt={redPlayer.champion}
                        className={`object-cover transition-all duration-500 ${!isBlueLeading && diff.goldDiff !== 0 ? 'opacity-100' : 'opacity-40 grayscale'}`}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="stat-card border-border/50 bg-background/30 backdrop-blur-sm ring-1 ring-white/5 col-span-1 lg:col-span-1">
          <CardHeader className="border-b border-border/40">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <ZapIcon className="h-4 w-4 text-yellow-500" />
              Efficiency index (Damage/Gold)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4 border-r border-border/40 pr-4">
                <p className="text-[9px] font-black uppercase tracking-tighter text-blue-400 mb-2">Invokers Delta</p>
                {stats.players.blue.slice(0, 5).map(p => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-muted border border-white/5 overflow-hidden ring-1 ring-white/5">
                        <img src={getChampionIcon(p.champion, "14.1.1")} className="object-cover" />
                      </div>
                      <span className="text-[10px] font-bold truncate max-w-[55px] uppercase">{p.name}</span>
                    </div>
                    <span className="font-mono text-[10px] font-black text-amber-500">{p.dpg.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <p className="text-[9px] font-black uppercase tracking-tighter text-red-400 mb-2">RED Delta</p>
                {stats.players.red.slice(0, 5).map(p => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-muted border border-white/5 overflow-hidden ring-1 ring-white/5">
                        <img src={getChampionIcon(p.champion, "14.1.1")} className="object-cover" />
                      </div>
                      <span className="text-[10px] font-bold truncate max-w-[55px] uppercase">{p.name}</span>
                    </div>
                    <span className="font-mono text-[10px] font-black text-amber-500">{p.dpg.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vision Control */}
        <Card className="stat-card border-border/50 bg-background/30 backdrop-blur-sm ring-1 ring-white/5 col-span-1">
          <CardHeader className="border-b border-border/40">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <EyeIcon className="h-4 w-4 text-blue-400" />
              Vision Control Score (VSPM)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {stats.players.blue.map(p => {
              const opponent = stats.players.red.find(r => r.role === p.role)!
              const totalVspm = p.vspm + opponent.vspm
              const bluePercent = (p.vspm / totalVspm) * 100

              return (
                <div key={p.role} className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-black uppercase text-blue-400 truncate max-w-[70px]">{p.name}</span>
                    <Badge variant="outline" className="text-[7px] font-black h-4 px-2 border-border/40 bg-muted/5 tracking-wider">{p.role}</Badge>
                    <span className="text-[9px] font-black uppercase text-red-400 truncate max-w-[70px]">{opponent.name}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex ring-1 ring-white/5">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000 border-r border-white/20" 
                      style={{ width: `${bluePercent}%` }}
                    />
                    <div 
                      className="h-full bg-red-500 transition-all duration-1000" 
                      style={{ width: `${100 - bluePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between px-1">
                    <span className="text-[9px] font-mono font-black text-foreground/70">{p.vspm.toFixed(2)}</span>
                    <span className="text-[9px] font-mono font-black text-foreground/70">{opponent.vspm.toFixed(2)}</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Resource vs Impact */}
        <Card className="stat-card border-border/50 bg-background/30 backdrop-blur-sm ring-1 ring-white/5 col-span-1 lg:col-span-1">
          <CardHeader className="border-b border-border/40">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <ScatterChartIcon className="h-4 w-4 text-purple-500" />
              Market Efficiency: Gold vs Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[260px] w-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={true} />
                  <XAxis 
                    type="number" 
                    dataKey="goldShare" 
                    name="Ouro %" 
                    unit="%" 
                    stroke="#ffffff20" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={[0, 40]}
                    tickCount={5}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="damageShare" 
                    name="Dano %" 
                    unit="%" 
                    stroke="#ffffff20" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={[0, 50]}
                    tickCount={5}
                  />
                  <ZAxis type="category" dataKey="role" name="Posição" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3', stroke: '#ffffff20' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        const isBlue = stats.players.blue.some(p => p.name === data.name)
                        return (
                          <div className={`p-4 rounded border-2 backdrop-blur-xl ${isBlue ? 'bg-blue-950/90 border-blue-500/30' : 'bg-red-950/90 border-red-500/30'}`}>
                            <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                               <div className={`h-2 w-2 rounded-full ${isBlue ? 'bg-blue-400' : 'bg-red-400'}`} />
                               <p className="text-[10px] font-black uppercase tracking-widest text-white">{data.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="flex flex-col">
                                 <span className="text-[8px] text-muted-foreground uppercase font-black">Gold Share</span>
                                 <span className="text-[11px] font-mono font-black text-white">{data.goldShare}%</span>
                               </div>
                               <div className="flex flex-col">
                                 <span className="text-[8px] text-muted-foreground uppercase font-black">Dmg Share</span>
                                 <span className="text-[11px] font-mono font-black text-white">{data.damageShare}%</span>
                               </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Scatter 
                    data={stats.correlations.goldVsDamage} 
                    shape={(props: any) => {
                      const { cx, cy, payload } = props
                      const isBlue = stats.players.blue.some(p => p.name === payload.name)
                      return (
                        <g transform={`translate(${cx},${cy})`}>
                           {isBlue ? (
                             <rect x="-6" y="-6" width="12" height="12" fill="#3b82f6" fillOpacity="0.8" className="stroke-blue-400/50" strokeWidth="1" />
                           ) : (
                             <circle r="6" fill="#ef4444" fillOpacity="0.8" className="stroke-red-400/50" strokeWidth="1" />
                           )}
                           <text x="10" y="4" fill="#ffffff40" fontSize="7" fontWeight="900" className="uppercase pointer-events-none">{payload.role.charAt(0)}</text>
                        </g>
                      )
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="px-6 py-3 bg-muted/5 border-t border-border/20 flex gap-4 justify-center">
               <div className="flex items-center gap-1.5">
                 <div className="h-1.5 w-1.5 rounded-sm bg-blue-500" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Unit Blue</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Unit Red</span>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


