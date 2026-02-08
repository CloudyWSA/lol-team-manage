"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  Plus,
  Eye,
  Shield,
  Edit2,
  Users,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Loader2,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PageNav, type PageNavTab } from "@/components/ui/page-nav"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@/lib/auth-context"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"

const scoutingTabs: PageNavTab[] = [
  { id: "teams", label: "Equipes", icon: Shield },
  { id: "players", label: "Jogadores", icon: Users },
]

export function ScoutingContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("teams")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  
  const [newTeam, setNewTeam] = useState({ 
    name: "", 
    region: "", 
    notes: "", 
    tier: "B" as "S" | "A" | "B" | "C" 
  })
  
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [editingTeam, setEditingTeam] = useState<any>(null)
  const [notesDraft, setNotesDraft] = useState("")

  // Queries
  const teams = useQuery(api.scouting.getScoutedTeams, user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip")
  const allPlayers = useQuery(api.scouting.getPlayersByTeam, teams && teams.length > 0 ? { teamId: teams[0]._id } : "skip") // Simplification for now: showing first team's players or we'd need a more global query
  
  // Mutations
  const addTeam = useMutation(api.scouting.addScoutedTeam)
  const updateNotes = useMutation(api.scouting.updateNotes)
  const removeTeam = useMutation(api.scouting.removeScoutedTeam)

  const handleRemoveTeam = async (id: Id<"scoutingTeams">) => {
    if (!confirm("Remover este time do scouting?")) return
    try {
      await removeTeam({ id })
      toast.success("Time removido")
    } catch (error) {
      toast.error("Erro ao remover time")
    }
  }

  const handleAddTeam = async () => {
    if (!newTeam.name || !newTeam.region || !user?.teamId) return
    
    try {
      await addTeam({
        ...newTeam,
        winRate: 50,
        recentForm: ["-", "-", "-", "-", "-"],
        alerts: 0,
        matchesAnalyzed: 0,
        scoutedBy: user.teamId as Id<"teams">,
      })
      toast.success("Time adicionado ao scouting!")
      setIsAddDialogOpen(false)
      setNewTeam({ name: "", region: "", notes: "", tier: "B" })
    } catch (error) {
      toast.error("Erro ao adicionar time")
    }
  }

  const handleEditNotes = (team: any) => {
    setEditingTeam(team)
    setNotesDraft(team.notes)
    setIsEditingNotes(true)
  }

  const handleSaveNotes = async () => {
    if (!editingTeam) return
    try {
      await updateNotes({
        id: editingTeam._id,
        notes: notesDraft
      })
      toast.success("Notas atualizadas!")
      setIsEditingNotes(false)
    } catch (error) {
      toast.error("Erro ao atualizar notas")
    }
  }

  const filteredTeams = teams?.filter((team: any) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  if (!teams) return <div className="flex h-60 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      <PageNav tabs={scoutingTabs} activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar time..."
            className="bg-muted/50 pl-9"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Time
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Time ao Scouting</DialogTitle>
              <DialogDescription>
                Registre um novo time para acompanhamento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Time</Label>
                <Input 
                  placeholder="Ex: Team Liquid" 
                  className="bg-muted/50" 
                  value={newTeam.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTeam({ ...newTeam, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Regiao</Label>
                  <Input 
                    placeholder="Ex: NA, EU, KR" 
                    className="bg-muted/50" 
                    value={newTeam.region}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTeam({ ...newTeam, region: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select value={newTeam.tier} onValueChange={(v: any) => setNewTeam({ ...newTeam, tier: v })}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S">Tier S</SelectItem>
                      <SelectItem value="A">Tier A</SelectItem>
                      <SelectItem value="B">Tier B</SelectItem>
                      <SelectItem value="C">Tier C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notas iniciais</Label>
                <Input 
                  placeholder="Observacoes sobre o time" 
                  className="bg-muted/50" 
                  value={newTeam.notes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTeam({ ...newTeam, notes: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleAddTeam}>
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditingNotes} onOpenChange={setIsEditingNotes}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Notas: {editingTeam?.name}</DialogTitle>
              <DialogDescription>Atualize a análise estratégica deste time.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Análise Estratégica</Label>
                <Textarea 
                  value={notesDraft}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotesDraft(e.target.value)}
                  className="bg-muted/50 min-h-[120px] resize-none"
                  placeholder="Descreva o estilo de jogo, pontos fortes e fracos..."
                />
              </div>
              <Button className="w-full" onClick={handleSaveNotes}>Salvar Notas</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="stat-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teams.length}</p>
                <p className="text-sm text-muted-foreground">Times monitorados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {teams.reduce((acc: number, t: any) => acc + t.alerts, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Alertas ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                <Eye className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {teams.reduce((acc: number, t: any) => acc + t.matchesAnalyzed, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Partidas analisadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">--</p>
                <p className="text-sm text-muted-foreground">Ativo no Scouting</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeTab === "teams" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team: any) => (
            <Link key={team._id} href={`/scouting/${team._id}`}>
              <Card className="stat-card border-border/50 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-lg font-bold">
                        {team.name.charAt(0)}
                      </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{team.name}</h3>
                        <TierBadge tier={team.tier} />
                      </div>
                      <p className="text-sm text-muted-foreground">{team.region}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={(e) => {
                          e.preventDefault()
                          handleEditNotes(team)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.preventDefault()
                          handleRemoveTeam(team._id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {team.alerts > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {team.alerts}
                        </Badge>
                      )}
                    </div>
                </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Win Rate</span>
                      <span className="font-medium">{team.winRate}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Forma Recente</span>
                      <div className="flex gap-1">
                        {team.recentForm.map((result: string, i: number) => (
                          <div
                            key={i}
                            className={`flex h-6 w-6 items-center justify-center rounded text-xs font-medium ${
                              result === "W"
                                ? "bg-green-500/10 text-green-500"
                                : result === "L"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {result}
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{team.notes}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">
                        {team.matchesAnalyzed} jogos analisados
                      </span>
                      <span className="flex items-center gap-1 text-xs text-primary">
                        Detalhes
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {filteredTeams.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-3xl">
              Nenhum time encontrado.
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams?.map((team: any) => (
            <PlayerList key={team._id} teamId={team._id} teamName={team.name} />
          ))}
          {(!teams || teams.length === 0) && (
            <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-3xl">
              Adicione um time primeiro para gerenciar jogadores.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PlayerList({ teamId, teamName }: { teamId: Id<"scoutingTeams">, teamName: string }) {
  const players = useQuery(api.scouting.getPlayersByTeam, { teamId })
  
  if (!players) return null
  if (players.length === 0) return null

  return (
    <>
      {players.map((player: any) => (
        <Link key={player._id} href={`/scouting/${teamId}/player/${player._id}`}>
          <Card className="stat-card border-border/50 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary text-lg font-bold">
                    {player.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{player.name}#{player.tagline}</h3>
                    <p className="text-xs text-muted-foreground">{teamName} • {player.region}</p>
                  </div>
                </div>
                {player.rank && (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                    {player.rank}
                  </Badge>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-muted/30 p-2">
                  <p className="text-[10px] uppercase font-black opacity-40">Win Rate</p>
                  <p className="text-sm font-bold">{player.winRate || 0}%</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-2">
                  <p className="text-[10px] uppercase font-black opacity-40">Partidas</p>
                  <p className="text-sm font-bold">{player.games || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </>
  )
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    S: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    A: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    B: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    C: "bg-gray-500/10 text-gray-500 border-gray-500/30",
  }

  return (
    <Badge variant="outline" className={`text-xs ${colors[tier] || colors.C}`}>
      Tier {tier}
    </Badge>
  )
}
