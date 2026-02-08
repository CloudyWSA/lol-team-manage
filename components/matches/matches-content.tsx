"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageNav, type PageNavTab } from "@/components/ui/page-nav"
import {
  Calendar,
  Clock,
  Trophy,
  TrendingUp,
  Filter,
  ChevronRight,
  Play,
  Eye,
  ExternalLink,
  Flame,
  History,
  BarChart3,
  Plus,
  Loader2,
  Trash2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@/lib/auth-context"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"

const matchesTabs: PageNavTab[] = [
  { id: "upcoming", label: "Próximas", icon: Calendar },
  { id: "history", label: "Histórico", icon: History },
  { id: "stats", label: "Estatísticas", icon: BarChart3 },
]

export function MatchesContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [expandedMatch, setExpandedMatch] = useState<Id<"officialMatches"> | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newMatch, setNewMatch] = useState({
    tournament: "CBLOL 2026 Split 1",
    opponent: "",
    date: "",
    time: "",
    stage: "Semana 1",
    broadcast: "",
  })

  // Queries
  const allMatches = useQuery(api.matches.listByTeam, user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip")
  const createMatch = useMutation(api.matches.createMatch)
  const deleteMatch = useMutation(api.matches.deleteMatch)

  const upcomingMatches = allMatches?.filter((m: any) => !m.result) || []
  const matchHistory = allMatches?.filter((m: any) => m.result) || []

  const handleCreateMatch = async () => {
    if (!newMatch.opponent || !newMatch.date || !user?.teamId) return
    try {
      await createMatch({
        ...newMatch,
        teamId: user.teamId as Id<"teams">,
        date: newMatch.date.split("-").reverse().join("/")
      })
      toast.success("Partida agendada!")
      setIsAddDialogOpen(false)
      setNewMatch({
        tournament: "CBLOL 2026 Split 1",
        opponent: "",
        date: "",
        time: "",
        stage: "Semana 1",
        broadcast: "",
      })
    } catch (error) {
      toast.error("Erro ao agendar partida")
    }
  }

  const handleDeleteMatch = async (id: Id<"officialMatches">) => {
    if (!confirm("Tem certeza que deseja excluir esta partida?")) return
    try {
      await deleteMatch({ id })
      toast.success("Partida excluída")
    } catch (error) {
      toast.error("Erro ao excluir partida")
    }
  }

  if (!allMatches) return <div className="flex h-60 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageNav tabs={matchesTabs} activeTab={activeTab} onTabChange={setActiveTab} className="sm:w-auto" />
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agendar Partida
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Agendar Nova Partida</DialogTitle>
              <DialogDescription>
                Registre uma partida oficial no calendário.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Torneio</Label>
                <Input 
                  value={newMatch.tournament}
                  onChange={(e) => setNewMatch({ ...newMatch, tournament: e.target.value })}
                  placeholder="Ex: CBLOL 2026"
                />
              </div>
              <div className="space-y-2">
                <Label>Adversário</Label>
                <Input 
                  value={newMatch.opponent}
                  onChange={(e) => setNewMatch({ ...newMatch, opponent: e.target.value })}
                  placeholder="Nome do time"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input 
                    type="date"
                    value={newMatch.date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMatch({ ...newMatch, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input 
                    type="time"
                    value={newMatch.time}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMatch({ ...newMatch, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fase/Semana</Label>
                  <Input 
                    value={newMatch.stage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMatch({ ...newMatch, stage: e.target.value })}
                    placeholder="Ex: Semana 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link da Transmissão</Label>
                  <Input 
                    value={newMatch.broadcast}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMatch({ ...newMatch, broadcast: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleCreateMatch}>
                <Trophy className="mr-2 h-4 w-4" />
                Agendar Partida
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activeTab === "upcoming" && (
        <div className="space-y-4">
          {upcomingMatches.length === 0 ? (
            <Card className="stat-card border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">Nenhuma partida agendada</p>
              </CardContent>
            </Card>
          ) : (
            upcomingMatches.map((match: any) => (
              <Card key={match._id} className="stat-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                        <Trophy className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <Badge variant="secondary" className="mb-2">
                          {match.tournament}
                        </Badge>
                        <h3 className="text-xl font-bold">vs. {match.opponent}</h3>
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {match.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {match.time}
                          </span>
                          <Badge variant="outline">{match.stage}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {match.broadcast && (
                        <Button variant="outline" asChild>
                          <a href={match.broadcast} target="_blank" rel="noopener noreferrer">
                            <Play className="mr-2 h-4 w-4" />
                            Assistir
                            <ExternalLink className="ml-2 h-3 w-3" />
                          </a>
                        </Button>
                      )}
                      <Link href={`/matches/${match._id}`}>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteMatch(match._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Input placeholder="Buscar por time ou torneio..." className="bg-muted/50" />
            </div>
          </div>

          {matchHistory.length === 0 && (
            <Card className="stat-card border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <History className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">Nenhuma partida no histórico</p>
              </CardContent>
            </Card>
          )}

          {matchHistory.map((match: any) => (
            <Card key={match._id} className="stat-card border-border/50 overflow-hidden">
              <CardContent className="p-0">
                <Link
                  href={`/matches/${match._id}`}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold ${
                        match.won ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {match.won ? "W" : "L"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">vs. {match.opponent}</h3>
                        <Badge variant={match.won ? "default" : "destructive"}>{match.result}</Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{match.tournament}</span>
                        <span>{match.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 -mr-2" onClick={(e: React.MouseEvent) => {
                      e.preventDefault()
                      handleDeleteMatch(match._id)
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "stats" && (
        <div className="flex flex-col items-center justify-center h-60 border-2 border-dashed rounded-3xl opacity-50">
          <BarChart3 className="h-10 w-10 mb-2" />
          <p className="font-bold">Estatísticas da Temporada</p>
          <p className="text-xs">Processando dados dos jogos oficiais registrados...</p>
        </div>
      )}
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string
  subtitle: string
  highlight?: boolean
}

function StatsCard({ title, value, subtitle, highlight }: StatsCardProps) {
  return (
    <Card className={`stat-card border-border/50 ${highlight ? "invokers-glow-sm" : ""}`}>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className={`text-2xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  )
}
