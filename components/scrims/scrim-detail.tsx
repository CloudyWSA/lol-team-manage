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
} from "lucide-react"
import { 
  getChampionIcon, 
} from "@/lib/riot-assets"
import {
  MatchTeamRoster,
} from "@/components/matches/match-detail-shared"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"

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
  const updateTrainingPlan = useMutation(api.scrims.updateTrainingPlan)

  const [isPlanEditing, setIsPlanEditing] = useState(false)
  const [focusDraft, setFocusDraft] = useState("")
  const [objectivesDraft, setObjectivesDraft] = useState<string[]>([])
  const [newObjective, setNewObjective] = useState("")

  // Sync draft with scrim data when editing starts
  useEffect(() => {
    if (isPlanEditing && scrim?.trainingPlan) {
      setFocusDraft(scrim.trainingPlan.focus)
      setObjectivesDraft(scrim.trainingPlan.objectives)
    } else if (isPlanEditing && !scrim?.trainingPlan) {
      setFocusDraft("")
      setObjectivesDraft([])
    }
  }, [isPlanEditing, scrim])

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

  const addObjective = () => {
    if (newObjective.trim()) {
      setObjectivesDraft([...objectivesDraft, newObjective.trim()])
      setNewObjective("")
    }
  }

  const removeObjective = (index: number) => {
    setObjectivesDraft(objectivesDraft.filter((_, i) => i !== index))
  }

  if (!scrim) return <div className="flex h-60 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  const planData = scrim.trainingPlan || {
    objectives: [
      "Defina os objetivos para este treino..."
    ],
    focus: "Descreva o foco principal do treino aqui."
  }

  // Map games to display format
  const matches = scrim.games.map(g => ({
    id: g._id,
    number: g.gameNumber,
    result: g.result === "W" ? "Victory" : "Defeat",
    duration: g.duration,
    teams: {
      blue: {
        name: "Invokers",
        won: g.result === "W",
        players: [
          { name: "ThunderStrike", role: "Top", champion: "Jax" },
          { name: "ShadowJungle", role: "Jungle", champion: "LeeSin" },
          { name: "ArcaneWizard", role: "Mid", champion: "Orianna" },
          { name: "PhantomADC", role: "ADC", champion: "Ezreal" },
          { name: "GuardianSupp", role: "Support", champion: "Leona" },
        ]
      },
      red: {
        name: scrim.opponent,
        won: g.result === "L",
        players: []
      }
    }
  }))

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
                          onChange={(e) => setNewObjective(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addObjective()}
                          className="bg-muted/50"
                        />
                        <Button onClick={addObjective} size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {objectivesDraft.map((obj, i) => (
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
                        onChange={(e) => setFocusDraft(e.target.value)}
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
                <CardTitle className="flex items-center gap-2 text-yellow-500">
                  <AlertCircle className="h-5 w-5" /> Perfil do Adversário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">"Estilo de jogo agressivo no early game, focado em dives bot side."</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === "matches" && (
          <div className="space-y-6">
            {matches.length > 0 ? (
              <>
                <div className="flex gap-2 p-1 rounded-xl bg-muted/30 border border-border/50 w-fit">
                  {matches.map((match, idx) => (
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
                <MatchTeamRoster team={matches[selectedMatch].teams.blue} isBlue={true} version={gameVersion} />
                <Card className="stat-card border-border/50 p-6 opacity-60">
                  <p className="text-center text-sm font-medium">Dados detalhados da partida API Riot em processamento...</p>
                </Card>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl opacity-50">
                <Gamepad2 className="h-10 w-10 mb-2" />
                <p className="font-bold">Nenhum registro de partida encontrado</p>
                <p className="text-xs">Os dados das partidas individuais serão sincronizados após o treino.</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "media" && (
           <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl opacity-50">
            <Video className="h-10 w-10 mb-2" />
            <p className="font-bold">VODs ainda não disponíveis</p>
            <p className="text-xs">Uploade os replays para iniciar a análise automática.</p>
          </div>
        )}
        
        {activeTab === "notes" && (
          <div className="space-y-6">
             <Card className="stat-card border-border/50 p-6">
                <h3 className="font-bold mb-4">Notas Estratégicas</h3>
                <p className="text-sm leading-relaxed">{scrim.notes || "Sem observações adicionais para este scrim."}</p>
             </Card>
          </div>
        )}
      </div>
    </div>
  )
}
