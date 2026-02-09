"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageNav, type PageNavTab } from "@/components/ui/page-nav"
import {
  Eye,
  BarChart3,
  Video as VideoIcon,
  ChevronLeft,
  Calendar,
  Clock,
  Youtube,
  ExternalLink,
  User,
  Loader2,
  Trophy,
  RefreshCw,
  Gamepad2,
} from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  MatchTeamRoster,
} from "@/components/matches/match-detail-shared"
import { MatchAnalyticalTabs } from "@/components/matches/match-analytical-tabs"
import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

const officialMatchTabs: PageNavTab[] = [
  { id: "overview", label: "Visão Geral", icon: Eye },
  { id: "analytical", label: "Análise Avançada", icon: BarChart3 },
  { id: "media", label: "Broadcast & POVs", icon: VideoIcon },
]

export function OfficialMatchDetail({ matchId, gameId, gameVersion }: { matchId: string, gameId: string, gameVersion: string }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedMatchIdx, setSelectedMatchIdx] = useState(0)
  
  // Dialog State
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)
  const [matchIdInput, setMatchIdInput] = useState("")
  const [gameNumberInput, setGameNumberInput] = useState("1")
  const [syncRegion, setSyncRegion] = useState("BR")
  const [isSyncing, setIsSyncing] = useState(false)

  // Convex Query
  const match = useQuery(api.matches.getMatchWithGames, matchId ? { matchId: matchId as Id<"officialMatches"> } : "skip")
  const user = useAuth().user
  const team = useQuery(api.teams.getTeam, match?.teamId ? { teamId: match.teamId } : "skip")

  const syncOfficialGame = useAction(api.riotApi.syncOfficialGame)

  const handleMatchSync = async () => {
    if (!match || !matchIdInput) return
    setIsSyncing(true)
    try {
      if (!match) return
      await syncOfficialGame({
        matchId: match._id as Id<"officialMatches">,
        riotMatchId: matchIdInput,
        gameNumber: parseInt(gameNumberInput),
        region: syncRegion,
      })
      toast.success(`Partida ${gameNumberInput} sincronizada com sucesso!`)
      setIsSyncDialogOpen(false)
      setMatchIdInput("")
    } catch (error: any) {
      toast.error(error.message || "Erro ao sincronizar partida")
    } finally {
      setIsSyncing(false)
    }
  }

  // Memoized data mapping similar to ScrimDetail
  const matches = useMemo(() => {
    if (!match || !match.games) return []
    return match.games.map(g => {
      const mapParticipant = (p: any) => ({
        name: p.summonerName,
        champion: p.championName,
        role: p.role,
        dmg: p.totalDamageDealtToChampions || 0,
        vision: p.visionScore || 0,
        gold: p.goldEarned || 0,
        kda: typeof p.kills === 'number' ? `${p.kills}/${p.deaths}/${p.assists}` : "0/0/0",
        cs: p.cs || 0,
        items: (p.items || []).slice(0, 6).map((id: number) => ({ id })),
        trinket: p.items?.[6] ? { id: p.items[6] } : null,
        win: p.win
      })

      return {
        id: g._id,
        number: g.gameNumber,
        result: g.result === "W" ? "Victory" : g.result === "L" ? "Defeat" : "Played", // Use stored result
        duration: g.duration,
        teams: {
          blue: {
            name: "Blue Side", // Or map to team name if possible
            won: g.result === "W" && g.side === "Blue" || g.result === "L" && g.side === "Red", // Simplified
            stats: g.blueStats,
            players: g.participants?.filter((p: any) => p.teamId === 100).map(mapParticipant) || []
          },
          red: {
            name: "Red Side",
            won: g.result === "W" && g.side === "Red" || g.result === "L" && g.side === "Blue",
            stats: g.redStats,
            players: g.participants?.filter((p: any) => p.teamId === 200).map(mapParticipant) || []
          }
        }
      }
    })
  }, [match])

  if (!match) return <div className="flex h-60 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  const currentMatchData = matches[selectedMatchIdx]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/matches">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">vs. {match.opponent}</h1>
              <Badge variant="outline">
                {match.stage}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-4 text-muted-foreground">
               <span className="flex items-center gap-1.5 text-sm uppercase font-black tracking-widest text-primary">
                {match.tournament}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-4 w-4" />
                {match.date}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <Clock className="h-4 w-4" />
                {match.time || "--:--"}
              </span>
            </div>
          </div>
        </div>
         <div className="flex items-center gap-4 rounded-2xl bg-muted/30 p-4 border border-border/50">
            <div className="text-center">
              <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Resultado</p>
              <p className="text-3xl font-black text-primary">{match.result || "-"}</p>
            </div>
          </div>
      </div>

      <PageNav tabs={officialMatchTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === "overview" && (
           <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 p-1 rounded-xl bg-muted/30 border border-border/50 w-fit">
                {matches.length > 0 && matches.map((m: any, idx: number) => (
                  <Button
                    key={m.id}
                    variant={selectedMatchIdx === idx ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedMatchIdx(idx)}
                    className="rounded-lg font-bold"
                  >
                    Game {m.number}
                  </Button>
                ))}
              </div>
              <Button onClick={() => setIsSyncDialogOpen(true)} variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
                <RefreshCw className="h-4 w-4 mr-2" /> Sincronizar Partida
              </Button>
            </div>

            {matches.length > 0 ? (
              <>
                {currentMatchData && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <MatchTeamRoster team={currentMatchData.teams.blue} isBlue={true} version={gameVersion} />
                    <MatchTeamRoster team={currentMatchData.teams.red} isBlue={false} version={gameVersion} />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl opacity-50">
                <Gamepad2 className="h-10 w-10 mb-2" />
                <p className="font-bold">Nenhum registro de partida encontrado</p>
                <p className="text-xs mb-4">Sincronize com a Riot API para ver os detalhes.</p>
                <Button onClick={() => setIsSyncDialogOpen(true)} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" /> Sincronizar com Riot Match ID
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "analytical" && <MatchAnalyticalTabs />}

        {activeTab === "media" && (
          <div className="grid lg:grid-cols-2 gap-6">
              <Card className="stat-card border-border/50 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-500" />
                    Transmissão Oficial
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-video bg-black flex items-center justify-center">
                    {match.broadcast ? (
                         <iframe 
                           width="100%" 
                           height="100%" 
                           src={match.broadcast.replace("watch?v=", "embed/")} 
                           title="YouTube video player" 
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                           allowFullScreen
                           className="border-none"
                         ></iframe>
                    ) : (
                        <p className="text-muted-foreground">Link da transmissão não disponível</p>
                    )}
                  </div>
                </CardContent>
              </Card>
          </div>
        )}
      </div>

       {/* Sync Match Dialog */}
       <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sincronizar com Riot API</DialogTitle>
            <DialogDescription>
              Insira o ID da partida da Riot para importar os dados detalhados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Riot Match ID</Label>
              <Input 
                placeholder="Ex: BR1_2894723847" 
                value={matchIdInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMatchIdInput(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número do Game</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="5"
                  value={gameNumberInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGameNumberInput(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Região</Label>
                <Input 
                  value={syncRegion}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSyncRegion(e.target.value.toUpperCase())}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsSyncDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleMatchSync} disabled={isSyncing || !matchIdInput}>
                {isSyncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Sincronizar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
