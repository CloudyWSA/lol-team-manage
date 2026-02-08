"use client"

import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageNav, type PageNavTab } from "@/components/ui/page-nav"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Eye,
  Gamepad2,
  Video,
  Target,
  ChevronLeft,
  Calendar,
  Clock,
  Youtube,
  User,
  ExternalLink,
  Trophy,
  Swords,
  BarChart3,
  FileText,
  AlertCircle,
  TrendingUp,
  Map as MapIcon,
  Trash2,
  Edit2,
  Plus,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { 
  getChampionIcon, 
} from "@/lib/riot-assets"
import {
  MatchTeamRoster,
} from "@/components/matches/match-detail-shared"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"
import { ScrimMediaUploadModal } from "./scrim-media-upload-modal"

const scrimDetailTabs: PageNavTab[] = [
  { id: "overview", label: "Visão Geral", icon: Eye },
  { id: "matches", label: "Partidas", icon: Gamepad2 },
  { id: "media", label: "VODs & POVs", icon: Video },
  { id: "notes", label: "Estratégia & Notas", icon: Target },
]

export function ScrimDetail({ scrimId, gameVersion }: { scrimId: string, gameVersion: string }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedMatch, setSelectedMatch] = useState(0)
  
  // Convex Data
  const scrim = useQuery(api.scrims.getScrimWithGames, { id: scrimId as Id<"scrims"> })
  const team = useQuery(api.teams.getTeam, scrim?.teamId ? { teamId: scrim.teamId } : "skip")
  const scrimNotes = useQuery(api.scrimNotes.getNotesByScrim, { scrimId: scrimId as Id<"scrims"> })
  const scrimMedia = useQuery(api.media.getScrimMedia, { scrimId: scrimId as Id<"scrims"> })
  const updateTrainingPlan = useMutation(api.scrims.updateTrainingPlan)
  const addNote = useMutation(api.scrimNotes.addNote)
  const deleteNote = useMutation(api.scrimNotes.deleteNote)
  
  const generateUploadUrl = useAction(api.media.generateUploadUrl)
  const saveScrimMedia = useMutation(api.media.saveScrimMedia)
  const deleteScrimMedia = useMutation(api.media.deleteScrimMedia)

  const [isPlanEditing, setIsPlanEditing] = useState(false)
  const [isOpponentEditing, setIsOpponentEditing] = useState(false)
  const [isNotesEditing, setIsNotesEditing] = useState(false)
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null)
  
  const [focusDraft, setFocusDraft] = useState("")
  const [opponentProfileDraft, setOpponentProfileDraft] = useState("")
  const [notesDraft, setNotesDraft] = useState("")
  const [objectivesDraft, setObjectivesDraft] = useState<string[]>([])
  const [newObjective, setNewObjective] = useState("")
  
  const [matchIdInput, setMatchIdInput] = useState("")
  const [gameNumberInput, setGameNumberInput] = useState("1")
  const [syncRegion, setSyncRegion] = useState("BR")
  const [isSyncing, setIsSyncing] = useState(false)

  // Sync drafts with scrim data when editing starts
  useEffect(() => {
    if (isPlanEditing && scrim?.trainingPlan) {
      setFocusDraft(scrim.trainingPlan.focus)
      setObjectivesDraft(scrim.trainingPlan.objectives)
    } else if (isPlanEditing && !scrim?.trainingPlan) {
      setFocusDraft("")
      setObjectivesDraft([])
    }
  }, [isPlanEditing, scrim])

  useEffect(() => {
    if (isOpponentEditing && scrim) {
      setOpponentProfileDraft(scrim.opponentProfile || "")
    }
  }, [isOpponentEditing, scrim])

  useEffect(() => {
    if (isNotesEditing && scrim) {
      setNotesDraft(scrim.notes || "")
    }
  }, [isNotesEditing, scrim])

  const handleSavePlan = async () => {
    if (!scrim) return
    try {
      await updateTrainingPlan({
        id: scrim._id,
        trainingPlan: {
          focus: focusDraft,
          objectives: objectivesDraft,
        }
      })
      toast.success("Plano de treino atualizado!")
      setIsPlanEditing(false)
    } catch (error) {
      toast.error("Erro ao salvar plano")
    }
  }

  const updateOpponentProfile = useMutation(api.scrims.updateOpponentProfile)

  const handleSaveOpponentProfile = async () => {
    if (!scrim) return
    try {
      await updateOpponentProfile({
        id: scrim._id,
        opponentProfile: opponentProfileDraft,
      })
      toast.success("Perfil do adversário atualizado!")
      setIsOpponentEditing(false)
    } catch (error) {
      toast.error("Erro ao salvar perfil")
    }
  }

  const updateNotes = useMutation(api.scrims.updateNotes)

  const handleSaveNotes = async () => {
    if (!scrim) return
    try {
      await updateNotes({
        id: scrim._id,
        notes: notesDraft,
      })
      toast.success("Notas atualizadas!")
      setIsNotesEditing(false)
    } catch (error) {
      toast.error("Erro ao salvar notas")
    }
  }

  const syncScrimGame = useAction(api.riotApi.syncScrimGame)

  const handleMatchSync = async () => {
    if (!scrim || !matchIdInput) return
    setIsSyncing(true)
    try {
      await syncScrimGame({
        scrimId: scrim._id,
        matchId: matchIdInput,
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

  const addObjective = () => {
    if (newObjective.trim()) {
      setObjectivesDraft([...objectivesDraft, newObjective.trim()])
      setNewObjective("")
    }
  }

  const removeObjective = (index: number) => {
    setObjectivesDraft(objectivesDraft.filter((_: any, i: number) => i !== index))
  }

  const handleMediaUpload = async (data: any) => {
    if (!scrim) return
    
    try {
      let storageId = undefined
      let type: "youtube" | "video" | "image" = "youtube"
      let url = data.url

      if (data.file) {
        // Step 1: Get upload URL
        const uploadUrl = await generateUploadUrl()
        
        // Step 2: POST the file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": data.file.type },
          body: data.file,
        })
        
        if (!result.ok) throw new Error("Falha no upload do arquivo")
        
        const { storageId: sid } = await result.json()
        storageId = sid
        type = data.file.type.startsWith("image/") ? "image" : "video"
        url = undefined // Will be generated by the query from storageId
      } else if (url) {
        type = "youtube"
      }

      // Step 3: Save reference in database
      await saveScrimMedia({
        scrimId: scrim._id,
        type,
        title: data.file ? data.file.name : "Link Externo",
        url,
        storageId,
        tags: [],
      })

      toast.success("Mídia enviada com sucesso!")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao enviar mídia")
    }
  }

  // Memoized data mapping
  const matches = useMemo(() => {
    if (!scrim) return []
    return scrim.games.map(g => {
      const mapParticipant = (p: any) => ({
        name: p.summonerName,
        champion: p.championName,
        role: p.role,
        dmg: p.totalDamageDealtToChampions || p.dmg || 0,
        vision: p.visionScore || p.vision || 0,
        gold: p.goldEarned || p.gold || 0,
        kda: typeof p.kills === 'number' ? `${p.kills}/${p.deaths}/${p.assists}` : p.kda || "0/0/0",
        cs: p.cs || 0,
        items: (p.items || []).slice(0, 6).map((id: number) => ({ id })),
        trinket: p.items?.[6] ? { id: p.items[6] } : null,
        win: p.win
      })

      return {
        id: g._id,
        number: g.gameNumber,
        result: g.result === "W" ? "Victory" : "Defeat",
        duration: g.duration,
        teams: {
          blue: {
            name: team?.name || "Meu Time",
            won: g.result === "W",
            stats: g.blueStats,
            players: g.participants?.filter((p: any) => p.teamId === 100).map(mapParticipant) || []
          },
          red: {
            name: scrim.opponent,
            won: g.result === "L",
            stats: g.redStats,
            players: g.participants?.filter((p: any) => p.teamId === 200).map(mapParticipant) || []
          }
        }
      }
    })
  }, [scrim, team])

  if (!scrim) return <div className="flex h-60 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  const planData = scrim.trainingPlan || {
    objectives: [
      "Defina os objetivos para este treino..."
    ],
    focus: "Descreva o foco principal do treino aqui."
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/scrims">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">vs. {scrim.opponent}</h1>
              <Badge variant={scrim.status === "concluido" ? "secondary" : "default"}>
                {scrim.status.toUpperCase()}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-4 w-4" />
                {scrim.date}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                <Trophy className="h-4 w-4" />
                {scrim.format}
              </span>
            </div>
          </div>
        </div>
        {scrim.result && (
          <div className="flex items-center gap-4 rounded-2xl bg-muted/30 p-4 border border-border/50">
            <div className="text-center">
              <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Resultado</p>
              <p className="text-3xl font-black text-primary">{scrim.result}</p>
            </div>
          </div>
        )}
      </div>
      
      <PageNav tabs={scrimDetailTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="stat-card border-border/50 overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Plano de Treino
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsPlanEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-2" /> Editar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-3">
                        <Target className="h-4 w-4" /> Objetivos
                      </h4>
                      <ul className="space-y-2">
                        {planData.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-3">
                        <BarChart3 className="h-4 w-4" /> Foco Principal
                      </h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">{planData.focus}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Plan Dialog */}
              <Dialog open={isPlanEditing} onOpenChange={setIsPlanEditing}>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Editar Plano de Treino</DialogTitle>
                    <DialogDescription>
                      Defina os objetivos e o foco principal para este scrim.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <Label className="text-primary uppercase font-bold tracking-wider text-xs">Objetivos</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Novo objetivo..."
                          value={newObjective}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewObjective(e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && addObjective()}
                          className="bg-muted/50"
                        />
                        <Button onClick={addObjective} size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {objectivesDraft.map((obj: string, i: number) => (
                          <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/20 p-2">
                            <span className="text-sm">{obj}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeObjective(i)}
                              className="h-7 w-7 text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-primary uppercase font-bold tracking-wider text-xs">Foco Principal</Label>
                      <Textarea
                        placeholder="Ex: Praticar transição para Baron..."
                        value={focusDraft}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFocusDraft(e.target.value)}
                        className="bg-muted/50 resize-none"
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button variant="outline" onClick={() => setIsPlanEditing(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSavePlan}>
                        Salvar Alterações
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Card className="stat-card border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-yellow-500">
                    <AlertCircle className="h-5 w-5" /> Perfil do Adversário
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpponentEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" /> Editar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground italic">
                  {scrim.opponentProfile ? `"${scrim.opponentProfile}"` : "\"Nenhum perfil definido para este adversário.\""}
                </p>
              </CardContent>
            </Card>

            {/* Edit Opponent Profile Dialog */}
            <Dialog open={isOpponentEditing} onOpenChange={setIsOpponentEditing}>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Editar Perfil do Adversário</DialogTitle>
                  <DialogDescription>
                    Descreva o estilo de jogo, pontos fortes e fracos do adversário.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-yellow-500 uppercase font-bold tracking-wider text-xs">Observações Táticas</Label>
                    <Textarea
                      placeholder="Ex: Estilo de jogo agressivo no early game..."
                      value={opponentProfileDraft}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOpponentProfileDraft(e.target.value)}
                      className="bg-muted/50 resize-none"
                      rows={6}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={() => setIsOpponentEditing(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveOpponentProfile} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                      Salvar Perfil
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
        
        {activeTab === "matches" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 p-1 rounded-xl bg-muted/30 border border-border/50 w-fit">
                {matches.length > 0 && matches.map((match: any, idx: number) => (
                  <Button
                    key={match.id}
                    variant={selectedMatch === idx ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedMatch(idx)}
                    className="rounded-lg font-bold"
                  >
                    Game {match.number}
                  </Button>
                ))}
              </div>
              <Button onClick={() => setIsSyncDialogOpen(true)} variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
                <RefreshCw className="h-4 w-4 mr-2" /> Sincronizar Partida
              </Button>
            </div>

            {matches.length > 0 ? (
              <>
                {matches[selectedMatch] && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <MatchTeamRoster team={matches[selectedMatch].teams.blue} isBlue={true} version={gameVersion} />
                    <MatchTeamRoster team={matches[selectedMatch].teams.red} isBlue={false} version={gameVersion} />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl opacity-50">
                <Gamepad2 className="h-10 w-10 mb-2" />
                <p className="font-bold">Nenhum registro de partida encontrado</p>
                <p className="text-xs mb-4">Os dados das partidas individuais serão sincronizados após o treino.</p>
                <Button onClick={() => setIsSyncDialogOpen(true)} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" /> Sincronizar com Riot Match ID
                </Button>
              </div>
            )}

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
        )}
        
        {activeTab === "media" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Video className="h-4 w-4" /> Biblioteca de Mídia
              </h3>
              <Button onClick={() => setIsUploadModalOpen(true)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Adicionar Mídia
              </Button>
            </div>

            {scrimMedia && scrimMedia.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scrimMedia.map((item) => (
                  <Card key={item._id} className="stat-card border-border/50 group overflow-hidden">
                    <div 
                      className="aspect-video bg-muted/20 relative flex items-center justify-center overflow-hidden border-b border-border/50 cursor-zoom-in"
                      onClick={() => setSelectedMedia(item)}
                    >
                      {item.type === "image" && item.url ? (
                        <Image src={item.url} alt={item.title} fill className="object-cover" />
                      ) : item.type === "youtube" ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                          <Youtube className="h-10 w-10 text-red-600" />
                        </div>
                      ) : (
                        <Video className="h-10 w-10 text-primary/50" />
                      )}
                      
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => deleteScrimMedia({ id: item._id })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" asChild>
                           <a href={item.url} target="_blank" rel="noreferrer">
                             <ExternalLink className="h-3.5 w-3.5" />
                           </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl opacity-50">
                <Video className="h-10 w-10 mb-2" />
                <p className="font-bold">Nenhum VOD ou Screenshot</p>
                <p className="text-xs mb-4">Adicione replays ou fotos para documentar este treino.</p>
                <Button onClick={() => setIsUploadModalOpen(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Upload de Mídia
                </Button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "notes" && (
          <div className="space-y-6">
             <Card className="stat-card border-border/50 overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                       <FileText className="h-5 w-5 text-primary" /> Notas Estratégicas
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsNotesEditing(true)}>
                       <Edit2 className="h-4 w-4 mr-2" /> Editar Notas
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                   <p className="text-sm leading-relaxed whitespace-pre-wrap">
                     {scrim.notes || "Sem observações adicionais para este scrim."}
                   </p>
                </CardContent>
             </Card>

             {/* Edit Notes Dialog */}
             <Dialog open={isNotesEditing} onOpenChange={setIsNotesEditing}>
               <DialogContent className="sm:max-w-2xl">
                 <DialogHeader>
                   <DialogTitle>Editar Notas Estratégicas</DialogTitle>
                   <DialogDescription>
                     Adicione observações gerais, planos para o draft ou feedback pós-jogo.
                   </DialogDescription>
                 </DialogHeader>
                 <div className="space-y-4 py-4">
                   <div className="space-y-2">
                     <Label className="text-primary uppercase font-bold tracking-wider text-xs">Conteúdo das Notas</Label>
                     <Textarea
                       placeholder="Insira suas observações estratégicas aqui..."
                       value={notesDraft}
                       onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotesDraft(e.target.value)}
                       className="bg-muted/50 resize-none"
                       rows={12}
                     />
                   </div>
                   <div className="flex justify-end gap-3 pt-2">
                     <Button variant="outline" onClick={() => setIsNotesEditing(false)}>
                       Cancelar
                     </Button>
                     <Button onClick={handleSaveNotes}>
                       Salvar Notas
                     </Button>
                   </div>
                 </div>
               </DialogContent>
             </Dialog>

             {/* Categorized Notes */}
             <div className="grid gap-6 md:grid-cols-2 mt-6">
               {["tactical", "draft", "behavior", "general"].map((cat) => {
                 const catNotes = (scrimNotes as any)?.filter((n: any) => n.category === cat) || []
                 const icons: Record<string, any> = {
                   tactical: Target,
                   draft: Swords,
                   behavior: User,
                   general: FileText
                 }
                 const labels: Record<string, string> = {
                   tactical: "Tático",
                   draft: "Draft",
                   behavior: "Comportamento",
                   general: "Geral"
                 }
                 const Icon = icons[cat]
                 
                 return (
                   <Card key={cat} className="stat-card border-border/50 bg-muted/10">
                     <CardHeader className="pb-3">
                       <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                         <Icon className="h-4 w-4 text-primary" /> {labels[cat]}
                       </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-3">
                       {catNotes.length > 0 ? (
                         catNotes.map((note: any) => (
                           <div key={note._id} className="group relative rounded-lg bg-background/50 p-3 border border-border/30">
                             <p className="text-xs leading-relaxed">{note.content}</p>
                             <div className="mt-2 flex items-center justify-between">
                               <span className="text-[10px] text-muted-foreground font-medium">{note.author}</span>
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 onClick={() => deleteNote({ id: note._id })}
                                 className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity"
                               >
                                 <Trash2 className="h-3 w-3" />
                               </Button>
                             </div>
                           </div>
                         ))
                       ) : (
                         <p className="text-[11px] text-muted-foreground italic py-2">Nenhuma nota nesta categoria.</p>
                       )}
                       <div className="pt-2">
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="w-full justify-start text-[11px] font-bold hover:bg-primary/10 hover:text-primary"
                           onClick={() => {
                             const content = prompt(`Adicionar nota de ${labels[cat]}:`)
                             if (content) {
                               addNote({
                                 scrimId: scrim._id,
                                 category: cat as any,
                                 content,
                                 author: "Coach", 
                               })
                             }
                           }}
                         >
                           <Plus className="h-3 w-3 mr-2" /> Adicionar Nota
                         </Button>
                       </div>
                     </CardContent>
                   </Card>
                 )
               })}
             </div>
          </div>
        )}
      </div>
      <ScrimMediaUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={handleMediaUpload}
      />

      {/* Media Lightbox */}
      <Dialog open={!!selectedMedia} onOpenChange={(open: boolean) => !open && setSelectedMedia(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/90 flex items-center justify-center overflow-hidden" showCloseButton={false}>
          <div className="sr-only">
            <DialogHeader>
              <DialogTitle>{selectedMedia?.title || "Visualização de Mídia"}</DialogTitle>
              <DialogDescription>Expansão de vídeo ou imagem do scrim.</DialogDescription>
            </DialogHeader>
          </div>
          {selectedMedia && (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {selectedMedia.type === "image" ? (
                <div className="relative w-full h-full min-h-[50vh]">
                  <Image 
                    src={selectedMedia.url ?? ""} 
                    alt={selectedMedia.title} 
                    fill 
                    className="object-contain" 
                  />
                </div>
              ) : selectedMedia.type === "youtube" ? (
                <div className="aspect-video w-full max-w-5xl">
                  <iframe
                    src={selectedMedia.url?.replace("watch?v=", "embed/")}
                    className="w-full h-full rounded-xl"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video 
                  src={selectedMedia.url} 
                  controls 
                  autoPlay
                  className="max-w-full max-h-[85vh] rounded-lg"
                />
              )}
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white/90 text-sm font-bold">
                {selectedMedia.title}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
