"use client"

import React, { useMemo, useState, useEffect } from "react"
import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { 
  History as HistoryIcon, 
  MapPin, 
  Trophy, 
  Target, 
  Zap, 
  Sword, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  Eye,
  Coins,
  Crosshair,
  TrendingUp,
  Award,
  ArrowLeft,
  Shield,
  Activity,
  Timer,
  ShieldCheck,
  TrendingDown,
  Flame
} from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import { getChampionIcon, getItemIcon, getLatestVersion } from "@/lib/riot-assets"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PlayerSoloQDetailProps {
  teamId: string
  playerId: string
}

export function PlayerSoloQDetail({ teamId, playerId }: PlayerSoloQDetailProps) {
  const [riotVersion, setRiotVersion] = useState("14.3.1")
  const player = useQuery(api.scouting.getPlayerById, { id: playerId as Id<"scoutedPlayers"> })
  const team = useQuery(api.scouting.getTeamById, { id: teamId as Id<"scoutingTeams"> })
  const syncStats = useAction(api.riotApi.syncPlayerStats)
  const [isSyncing, setIsSyncing] = useState(false)
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)

  useEffect(() => {
    getLatestVersion().then(setRiotVersion)
  }, [])

  const handleSync = async () => {
    if (!player) return
    setIsSyncing(true)
    try {
      await syncStats({ playerId: player._id })
      toast.success("Dados sincronizados!")
    } catch (error) {
      console.error("Sync failed:", error)
      toast.error("Erro na sincronização")
    } finally {
      setIsSyncing(false)
    }
  }

  const matches = player?.matches || []
  
  // Aggregate Insights
  const insights = useMemo(() => {
    if (!matches.length) return null
    
    const avgDpm = matches.reduce((acc, m) => acc + (m.dpm || 0), 0) / matches.length
    const avgDmgShare = matches.reduce((acc, m) => acc + (m.damageShare || 0), 0) / matches.length
    const avgKp = matches.reduce((acc, m) => acc + (m.kp || 0), 0) / matches.length
    const pool = matches.reduce((acc: any, m) => {
      acc[m.championName] = (acc[m.championName] || 0) + 1
      return acc
    }, {})
    const topChampion = Object.entries(pool).sort((a: any, b: any) => b[1] - a[1])[0]

    return { avgDpm, avgDmgShare, avgKp, topChampion: topChampion?.[0] }
  }, [matches])

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Carregando analítica profunda...</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Back and Sync Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="hover:bg-white/5">
            <Link href={`/scouting/${teamId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para {team?.name || "Time"}
            </Link>
          </Button>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50">Ultima Sincronização</p>
                <p className="text-sm font-medium text-white/80">{player.lastUpdated ? new Date(player.lastUpdated).toLocaleString('pt-BR') : 'Nunca'}</p>
              </div>
            <Button 
              onClick={handleSync} 
              disabled={isSyncing}
              size="sm"
              className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
            >
              {isSyncing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Sincronizar
            </Button>
          </div>
        </div>

        {/* Header Section: Luxury Profile */}
        <div className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-[2rem] border border-white/5 bg-black/40 backdrop-blur-xl">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 transition-transform group-hover:scale-110 duration-700" />
                <Avatar className="w-24 h-24 border-2 border-primary/30 ring-8 ring-primary/5 rounded-[1.5rem] relative z-10">
                  <AvatarImage src={`https://ddragon.leagueoflegends.com/cdn/${riotVersion}/img/profileicon/1.png`} />
                  <AvatarFallback>{player.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-black border border-primary/40 px-3 py-1 rounded-xl text-[10px] font-black text-primary tracking-tighter shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] z-20 uppercase">
                  ACTIVE
                </div>
              </div>
              
              <div className="space-y-1 relative z-10">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black tracking-[ -0.05em] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                    {player.name}
                  </h1>
                  <span className="text-xl font-bold text-muted-foreground/30">#{player.tagline}</span>
                </div>
                <div className="flex items-center gap-4 text-sm mt-1">
                  <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black px-4 py-1 rounded-lg tracking-widest uppercase">
                    {player.rank || "UNRANKED"} {player.tier}
                  </Badge>
                  <span className="text-muted-foreground/60 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {player.region}
                  </span>
                  <span className="text-amber-500/80 font-black flex items-center gap-1.5 border-l border-white/10 pl-4">
                    <Trophy className="w-3.5 h-3.5" /> {player.lp} LP
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 min-w-[140px]">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">Win Rate</p>
               <p className="text-4xl font-black tracking-tighter text-emerald-400">{player.winRate}%</p>
               <Progress value={player.winRate} className="h-1 w-full bg-white/5 mt-3 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${player.winRate}%` }} />
               </Progress>
            </div>
          </div>
        </div>

        {/* Tactical Aggregates */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Medalhas Ganhas", value: matches.filter(m => m.win).length, sub: "Últimas 20", icon: Trophy, color: "text-amber-400" },
            { label: "Dano p/ Minuto", value: Math.round(insights?.avgDpm || 0).toLocaleString(), sub: "Média Global", icon: Sword, color: "text-rose-400" },
            { label: "DMG Share", value: `${(insights?.avgDmgShare || 0).toFixed(1)}%`, sub: "Relativo ao Time", icon: Target, color: "text-blue-400" },
            { label: "Kill Participation", value: `${(insights?.avgKp || 0).toFixed(1)}%`, sub: "Engajamento", icon: Crosshair, color: "text-emerald-400" },
          ].map((stat, i) => (
            <Card key={i} className="bg-white/[0.01] border-white/5 p-6 rounded-[1.5rem] relative overflow-hidden group hover:bg-white/[0.03] transition-all duration-500">
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/30">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                </div>
                <p className="text-[9px] font-bold text-muted-foreground/20 italic tracking-wide">{stat.sub}</p>
              </div>
              <stat.icon className={cn("w-16 h-16 opacity-5 absolute -right-4 -bottom-4 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700", stat.color)} />
            </Card>
          ))}
        </div>

        {/* Match History Editorial List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black tracking-tighter uppercase flex items-center gap-3">
              <HistoryIcon className="w-5 h-5 text-primary" /> Dossier de Combate
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent mx-6" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Archive 2026.RIOT.V1</p>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {matches.map((match, idx) => (
                <motion.div
                  key={match.matchId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <MatchRow 
                    match={match} 
                    expanded={expandedMatch === match.matchId}
                    onToggle={() => setExpandedMatch(expandedMatch === match.matchId ? null : match.matchId)}
                    riotVersion={riotVersion}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {matches.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <HistoryIcon className="h-12 w-12 text-white/5 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold tracking-tight">Nenhuma partida registrada neste dossier.</p>
                <Button variant="link" className="text-primary mt-2 font-black uppercase text-xs tracking-widest" onClick={handleSync}>
                   Carregar Arquivos Agora
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

function MatchRow({ match, expanded, onToggle, riotVersion }: { match: any, expanded: boolean, onToggle: () => void, riotVersion: string }) {
  const isWin = match.win
  const [activeInterval, setActiveInterval] = useState<string>("15m")
  const gameDate = new Date(match.gameEndTimestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const gameDuration = `${Math.floor(match.gameDuration / 60)}:${(match.gameDuration % 60).toString().padStart(2, '0')}`

  const role = match.position || "UNKNOWN"
  
  const radarData = useMemo(() => [
    { subject: 'Dano', A: Math.min(100, ((match.dpm || 0) / 1100) * 100), fullMark: 100 },
    { subject: 'Gold', A: Math.min(100, ((match.goldShare || 0) / 30) * 100), fullMark: 100 },
    { subject: 'Tanque', A: Math.min(100, (((match.damageSelfMitigated || 0) + (match.totalDamageTaken || 0)) / 40000) * 100), fullMark: 100 },
    { subject: 'Farm', A: Math.min(100, ((match.cspm || 0) / 10) * 100), fullMark: 100 },
    { subject: 'Visão', A: Math.min(100, ((match.visionScore || 0) / (role === 'UTILITY' ? 80 : 40)) * 100), fullMark: 100 },
    { subject: 'Combate', A: Math.min(100, ((match.kp || 0) / 80) * 100), fullMark: 100 },
  ], [match, role])

  return (
    <Card className={cn(
      "overflow-hidden border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500 rounded-[1.5rem]",
      expanded && "bg-white/[0.05] ring-2 ring-white/10 z-20"
    )}>
      {/* Visual Indicator Vertical Bar */}
      <div className="flex flex-col sm:flex-row items-stretch min-h-[100px]">
        <div className={cn("w-1 sm:w-2 shrink-0 h-full sm:h-auto", isWin ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]")} />
        
        <div className="flex-1 p-4 flex flex-col sm:flex-row items-center gap-6">
          {/* Result & Identity */}
          <div className="w-20 text-center space-y-1">
            <p className={cn("text-xs font-black uppercase tracking-widest", isWin ? "text-emerald-400" : "text-red-400")}>
              {isWin ? "Victory" : "Defeat"}
            </p>
            <p className="text-[10px] font-black text-muted-foreground/60">{gameDate}</p>
            <p className="text-[10px] font-mono opacity-40">{gameDuration}</p>
          </div>

          {/* Champion Icon */}
          <div className="relative group/champ cursor-help">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover/champ:opacity-100 transition-opacity" />
                  <Avatar className="w-16 h-16 rounded-[1.2rem] border-2 border-white/10 ring-4 ring-black/20 relative z-10 transition-transform group-hover/champ:scale-105">
                    <AvatarImage src={getChampionIcon(match.championName, riotVersion)} />
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-black border border-white/20 text-[8px] w-5 h-5 flex items-center justify-center rounded-lg font-black z-20">
                    {match.position?.charAt(0) || '?'}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-black border-white/10 text-[10px] font-black uppercase tracking-widest">
                {match.championName}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* KDA & Indicators */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-black tracking-[-0.05em]">
                {match.kills} / <span className="text-red-500">{match.deaths}</span> / {match.assists}
              </span>
              <div className="h-4 w-[1px] bg-white/10" />
              <p className="text-xs font-black tracking-widest opacity-60">{match.kda} KDA</p>
              <div className="flex gap-2">
                {(match.damageShare || 0) > 30 && <InsightTag label="Hyper-Carry" color="bg-red-500/20 text-red-400 border-red-500/30" />}
                {(match.kp || 0) > 70 && <InsightTag label="Team Player" color="bg-emerald-500/20 text-emerald-400 border-emerald-500/30" />}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 grayscale transition-all group-hover:grayscale-0 duration-700">
              {match.items.filter((id: number) => id !== 0).map((id: number, i: number) => (
                <img 
                  key={`${match.matchId}-item-${i}`} 
                  src={getItemIcon(id, riotVersion)} 
                  className="w-7 h-7 rounded-[0.4rem] border border-white/10 hover:scale-110 transition-transform" 
                  alt="Item" 
                />
              ))}
            </div>
          </div>

          {/* Core Metrics Grid - Adaptive */}
          <div className="hidden xl:grid grid-cols-2 gap-x-12 gap-y-2 min-w-[240px]">
            {role === 'UTILITY' ? (
              <>
                <StatRow label="Visão" value={match.visionScore || 0} icon={Eye} />
                <StatRow label="KP %" value={`${(match.kp || 0).toFixed(1)}%`} icon={Crosshair} />
                <StatRow label="DPM" value={Math.round(match.dpm || 0)} icon={Sword} />
                <StatRow label="Ouro %" value={`${(match.goldShare || 0).toFixed(1)}%`} icon={Coins} />
              </>
            ) : role === 'JUNGLE' ? (
              <>
                <StatRow label="Objetivos" value={(match.teamObjectives?.dragon?.kills || 0) + (match.teamObjectives?.baron?.kills || 0)} icon={Target} />
                <StatRow label="KP %" value={`${(match.kp || 0).toFixed(1)}%`} icon={Crosshair} />
                <StatRow label="DPM" value={Math.round(match.dpm || 0)} icon={Sword} />
                <StatRow label="CSPM" value={(match.cspm || 0).toFixed(1)} icon={TrendingUp} />
              </>
            ) : (
              <>
                <StatRow label="DPM" value={Math.round(match.dpm || 0)} icon={Sword} />
                <StatRow label="CSPM" value={(match.cspm || 0).toFixed(1)} icon={TrendingUp} />
                <StatRow label="Dano %" value={`${(match.damageShare || 0).toFixed(1)}%`} icon={Zap} />
                <StatRow label="Ouro %" value={`${(match.goldShare || 0).toFixed(1)}%`} icon={Coins} />
              </>
            )}
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            className="rounded-2xl hover:bg-white/10 transition-colors w-12 h-12"
          >
            {expanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Deep Dive Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-black/40"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 p-8 lg:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                 <Crosshair className="w-64 h-64" />
              </div>
              
              {/* Radar Chart Section */}
              <div className="md:col-span-3 space-y-6 flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 border-b border-white/5 pb-2 w-full text-center">
                  Combat Topology
                </p>
                <div className="h-[240px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#ffffff08" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#ffffff20", fontSize: 10, fontWeight: 900 }} />
                      <Radar
                        name="Performance"
                        dataKey="A"
                        stroke="var(--primary)"
                        fill="var(--primary)"
                        fillOpacity={0.2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Timeline Progression Section */}
              <div className="md:col-span-3 space-y-6 flex flex-col items-center border-l border-white/5 pl-8">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/80 border-b border-white/5 pb-2 w-full text-center">
                   Dossier de Progressão
                </p>
                <div className="flex gap-2 p-1 bg-white/[0.03] rounded-xl border border-white/5">
                   {["10m", "15m", "20m"].map((int) => (
                      <button
                        key={int}
                        onClick={() => setActiveInterval(int)}
                        className={cn(
                          "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                          activeInterval === int ? "bg-primary text-black" : "text-muted-foreground/40 hover:text-white/60"
                        )}
                      >
                        {int}
                      </button>
                   ))}
                </div>
                {match.snapshots?.[activeInterval] ? (
                  <div className="w-full space-y-5 pt-2">
                     <div className="flex flex-col items-center gap-1 group/opp relative">
                        <Avatar className="w-8 h-8 rounded-lg border border-white/10 opacity-40 group-hover/opp:opacity-100 transition-opacity">
                           <AvatarImage src={getChampionIcon(match.snapshots[activeInterval].opponentHero || 'Unknown', riotVersion)} />
                        </Avatar>
                        <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">vs {match.snapshots[activeInterval].opponentHero || 'Inimigo'}</p>
                     </div>

                     <div className="space-y-4">
                        <LeadStat 
                           label="Vantagem de Ouro" 
                           value={match.snapshots[activeInterval].goldLead} 
                           suffix="k" 
                           isCurrency 
                           subValue={`Total: ${(match.snapshots[activeInterval].gold / 1000).toFixed(1)}k`}
                        />
                        <LeadStat 
                           label="Vantagem de XP" 
                           value={match.snapshots[activeInterval].xpLead} 
                           subValue={`Nível: ${match.snapshots[activeInterval].level}`}
                        />
                        <LeadStat 
                           label="Vantagem de CS" 
                           value={match.snapshots[activeInterval].csLead} 
                           suffix=" CS"
                           subValue={`Total: ${match.snapshots[activeInterval].cs}`}
                        />
                     </div>

                     <div className="pt-2 flex items-center justify-center gap-4 border-t border-white/5">
                        <ObjectiveMini icon={Flame} count={match.snapshots[activeInterval].objectives?.dragon} color="text-amber-400" label="Dragões aos 15m" />
                        <ObjectiveMini icon={Sword} count={match.snapshots[activeInterval].objectives?.baron} color="text-purple-400" label="Barões aos 15m" />
                     </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-10">
                    <HistoryIcon className="w-8 h-8 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">Snapshot Indisponível<br/>(Partida Curta)</p>
                  </div>
                )}
              </div>

              {/* Composition Comparison */}
              <div className="md:col-span-6 flex flex-col gap-8 border-l border-white/5 pl-8">
                {/* My Team */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
                     <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">Team Blue</p>
                     <div className="flex gap-4">
                        <ObjectiveMini icon={Flame} count={match.teamObjectives?.dragon?.kills} color="text-amber-400" label="Dragões Abatidos" />
                        <ObjectiveMini icon={Sword} count={match.teamObjectives?.baron?.kills} color="text-purple-400" label="Barões Abatidos" />
                     </div>
                  </div>
                  <div className="space-y-4">
                    {match.myTeam.map((p: any) => (
                      <CompParticipant key={p.puuid} p={p} isSelf={p.puuid === match.puuid} riotVersion={riotVersion} />
                    ))}
                  </div>
                </div>

                {/* Vertical Separator */}
                <div className="hidden lg:block w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent" />

                {/* Enemy Team */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between border-b border-red-500/20 pb-4">
                     <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500">Team Red</p>
                  </div>
                  <div className="space-y-4">
                    {match.enemyTeam.map((p: any) => (
                      <CompParticipant key={p.puuid} p={p} isSelf={false} riotVersion={riotVersion} />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Context Footer */}
              <div className="md:col-span-12 flex flex-wrap gap-4 pt-10 border-t border-white/5">
                 <InsightPill icon={Award} label="Damage Type" value={(match.magicDamageDealtToChampions || 0) > (match.physicalDamageDealtToChampions || 0) ? "Mixed/AP" : "Heavy AD"} />
                 <InsightPill icon={TrendingUp} label="Gold Delta" value={`${(match.goldShare || 0).toFixed(1)}% Share`} />
                 <InsightPill icon={ShieldCheck} label="Tanked" value={`${((match.totalDamageTaken || 0) / 1000).toFixed(1)}k`} />
                 <InsightPill icon={Zap} label="Mitigated" value={`${((match.damageSelfMitigated || 0) / 1000).toFixed(1)}k`} />
                 <InsightPill icon={Eye} label="Vision" value={match.visionScore || 0} />
                 <InsightPill icon={Award} label="Game Precision" value={`${(match.kp || 0).toFixed(1)}% KP`} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

function StatRow({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-xl bg-white/[0.08] border border-white/10">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground/80">{label}</p>
        <p className="text-sm font-black tracking-tight text-white">{value}</p>
      </div>
    </div>
  )
}

function CompParticipant({ p, isSelf, riotVersion }: { p: any, isSelf: boolean, riotVersion: string }) {
  return (
    <div className={cn(
      "flex items-center gap-4 p-2.5 rounded-2xl transition-all duration-300",
      isSelf ? "bg-primary/10 ring-1 ring-primary/30 scale-105 z-10" : "hover:bg-white/[0.03]"
    )}>
      <Avatar className="w-10 h-10 rounded-xl border border-white/10 shadow-lg">
        <AvatarImage src={getChampionIcon(p.championName, riotVersion)} />
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black truncate tracking-tight">{p.riotIdGameName || p.summonerName}</p>
        <div className="flex items-center gap-2 mt-0.5">
           <p className="text-[10px] font-bold text-muted-foreground/60">{p.kills}/{p.deaths}/{p.assists}</p>
           {isSelf && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
        </div>
        {!isSelf && (
          <div className="mt-2 flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-white/5">
             <Tooltip>
                <TooltipTrigger asChild>
                   <div className="h-full bg-rose-500 opacity-60 cursor-help" style={{ width: `${Math.min(100, (p.totalDamageDealtToChampions / 50000) * 100)}%` }} />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[9px] font-black uppercase">Dano Causado: {p.totalDamageDealtToChampions.toLocaleString()}</TooltipContent>
             </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                   <div className="h-full bg-amber-500 opacity-60 cursor-help" style={{ width: `${Math.min(100, (p.goldEarned / 20000) * 100)}%` }} />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[9px] font-black uppercase">Ouro Acumulado: {p.goldEarned.toLocaleString()}</TooltipContent>
             </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}

function InsightTag({ label, color }: { label: string, color: string }) {
  return (
    <span className={cn("px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border shadow-sm", color)}>
      {label}
    </span>
  )
}

function LeadStat({ label, value, suffix = "", isCurrency = false, subValue }: { label: string, value: number, suffix?: string, isCurrency?: boolean, subValue?: string }) {
   const isPositive = value >= 0
   const displayValue = isCurrency ? (Math.abs(value) / 1000).toFixed(1) : Math.abs(value)
   
   return (
      <Tooltip>
         <TooltipTrigger asChild>
            <div className="w-full space-y-1.5 cursor-help group/lead">
               <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/80 group-hover/lead:text-primary transition-colors">{label}</span>
                  <span className={cn("text-[10px] font-black", isPositive ? "text-emerald-400" : "text-rose-400")}>
                     {isPositive ? "+" : "-"}{displayValue}{suffix}
                  </span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <div 
                        className={cn("h-full transition-all duration-700", isPositive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-rose-500 opacity-40")} 
                        style={{ width: `${Math.min(100, (Math.abs(value) / (isCurrency ? 3000 : 1000)) * 100)}%` }} 
                     />
                  </div>
                  {subValue && <span className="text-[8px] font-bold text-muted-foreground/40">{subValue}</span>}
               </div>
            </div>
         </TooltipTrigger>
         <TooltipContent side="right" className="text-[10px] font-black uppercase">
            {isPositive ? `Dominância de ${label}` : `Déficit de ${label}`}
         </TooltipContent>
      </Tooltip>
   )
}

function ObjectiveMini({ icon: Icon, count, color, label }: { icon: any, count: number, color: string, label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 group/obj cursor-help">
          <Icon className={cn("w-3.5 h-3.5 transition-transform group-hover/obj:scale-125", color)} />
          <span className="text-[11px] font-black opacity-60 text-white">{count || 0}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-[10px] font-black uppercase">{label}</TooltipContent>
    </Tooltip>
  )
}

function InsightPill({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-colors">
      <Icon className="w-4 h-4 text-primary" />
      <div>
         <span className="text-[9px] font-black text-muted-foreground/80 uppercase tracking-widest block">{label}</span>
         <span className="text-xs font-black text-white">{value}</span>
      </div>
    </div>
  )
}
