"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  History,
  ArrowLeft,
  Plus,
  AlertTriangle,
  TrendingUp,
  Eye,
  Target,
  Shield,
  Swords,
  User,
  Clock,
  FileText,
  ImageIcon,
  Video,
  Upload,
  ExternalLink,
  MessageSquare,
  Trash2,
  Edit,
  X,
  Play,
  Loader2,
  Youtube,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getChampionIcon, getItemIcon, getLatestVersion } from "@/lib/riot-assets"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PageNav, type PageNavTab } from "@/components/ui/page-nav"
import { cn } from "@/lib/utils"
import { MediaUploadModal } from "./media-upload-modal"

// Types
interface MediaItem {
  id: string
  type: "image" | "video" | "youtube"
  url: string
  thumbnail?: string
  title: string
  description?: string
  timestamp: string
  tags: string[]
}

interface Note {
  id: string
  content: string
  author: string
  timestamp: string
  category: "tactical" | "draft" | "behavior" | "general"
}

interface Pattern {
  id: string
  type: "danger" | "warning" | "info"
  title: string
  description: string
  media?: MediaItem[]
}

interface Alert {
  id: string
  date: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
}

interface Player {
  id: string
  name: string
  role: string
  champions: string[]
  kda: string
  cs: string
  soloQRank: string
  recentGames: number
  notes: Note[]
  avatar?: string
}

interface GameParticipant {
  champion: string
  role: string
  kda: string
  cs: string
  items: number[]
  gold: string
}

interface Game {
  id: string
  win: boolean
  duration: string
  score: string
  blueTeam: GameParticipant[]
  redTeam: GameParticipant[]
}

interface Match {
  id: string
  opponent: string
  date: string
  result: "W" | "L"
  score: string
  tournament: string
  games: Game[]
}

import { api } from "@/convex/_generated/api"
import { useQuery, useMutation, useAction } from "convex/react"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"

const scoutingDetailTabs: PageNavTab[] = [
  { id: "overview", label: "Visão Geral", icon: Eye },
  { id: "players", label: "Jogadores", icon: Users },
  { id: "patterns", label: "Padrões", icon: Target },
  { id: "media", label: "Mídia", icon: ImageIcon },
  { id: "matches", label: "Partidas", icon: History },
  { id: "notes", label: "Notas", icon: FileText },
]

interface TeamScoutingDetailProps {
  teamId: string
}

function StatCard({ title, value, icon: Icon, iconColor }: { 
  title: string
  value: string
  icon: React.ElementType
  iconColor: string 
}) {
  return (
    <Card className="stat-card border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </CardContent>
    </Card>
  )
}

function MediaGallery({ media, onAdd, onDelete }: { media: any[], onAdd: () => void, onDelete?: (id: Id<"scoutingMedia">) => void }) {
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black uppercase tracking-tight">Arquivos & Media</h3>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Arquivo
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {media?.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-border/50 rounded-[2rem]">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground font-medium">Nenhum arquivo de mídia encontrado.</p>
          </div>
        ) : (
          media?.map((item) => (
            <div
              key={item._id}
              className="group relative cursor-pointer overflow-hidden rounded-lg border border-border/50 bg-muted/30"
              onClick={() => setSelectedMedia(item)}
            >
              <div className="aspect-video bg-muted relative overflow-hidden">
                {item.type === "youtube" ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Youtube className="h-10 w-10 text-red-600" />
                  </div>
                ) : item.type === "video" ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                ) : item.url ? (
                  <img src={item.url} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest opacity-60">
                  {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 2).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] font-black uppercase bg-white/5 border-white/10">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                   variant="destructive" 
                   size="icon" 
                   className="h-7 w-7 rounded-full shadow-lg"
                   onClick={(e) => {
                     e.stopPropagation();
                     if(confirm("Deseja realmente excluir esta mídia?")) {
                       onDelete?.(item._id);
                     }
                   }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Media Preview Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-3xl">
          {selectedMedia && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMedia.title}</DialogTitle>
                <DialogDescription>{selectedMedia.description}</DialogDescription>
              </DialogHeader>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                {selectedMedia.type === "youtube" ? (
                  <div className="text-center">
                    <Youtube className="h-12 w-12 text-red-600 mx-auto" />
                    <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vídeo do YouTube</p>
                    <Button variant="outline" size="sm" className="mt-4 bg-white/5 border-white/10 hover:bg-white/10" asChild>
                      <a href={selectedMedia.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Abrir no YouTube
                      </a>
                    </Button>
                  </div>
                ) : selectedMedia.type === "image" && selectedMedia.url ? (
                  <img src={selectedMedia.url} alt={selectedMedia.title} className="w-full h-full object-contain" />
                ) : selectedMedia.type === "video" && selectedMedia.url ? (
                  <video src={selectedMedia.url} controls className="w-full h-full" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedMedia.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function NotesSection({ notes, onAdd }: { notes: any[], onAdd: () => void }) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "tactical": return "bg-blue-500/10 text-blue-500 border-blue-500/30"
      case "draft": return "bg-purple-500/10 text-purple-500 border-purple-500/30"
      case "behavior": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "tactical": return "Tatica"
      case "draft": return "Draft"
      case "behavior": return "Comportamento"
      default: return "Geral"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black uppercase tracking-tight">Notas Estratégicas</h3>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Nota
        </Button>
      </div>
      <div className="grid gap-4">
        {notes.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-border/50 rounded-[2rem]">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground font-medium">Nenhuma nota tática registrada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`rounded-lg border p-4 ${getCategoryColor(note.category)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-[10px]">
                        {getCategoryLabel(note.category)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {note.author} - {note.timestamp}
                      </span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function TeamScoutingDetail({ teamId }: TeamScoutingDetailProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  
  // Queries
  const team = useQuery(api.scouting.getTeamById, { id: teamId as Id<"scoutingTeams"> })
  const players = useQuery(api.scouting.getPlayersByTeam, { teamId: teamId as Id<"scoutingTeams"> })
  const mediaItems = useQuery(api.media.getMediaByTeam, { teamId: teamId as Id<"scoutingTeams"> })

  // Mutations
  // Mutations & Actions
  const addScoutedPlayer = useMutation(api.scouting.addScoutedPlayer)
  const deleteMedia = useMutation(api.media.deleteMedia)
  const registerMatch = useAction(api.riotApi.registerTeamMatch)
  
  // Queries
  const matches = useQuery(api.scouting.getScoutingMatches, { teamId: teamId as Id<"scoutingTeams"> }) || []

  // Dialog visibility states
  const [isAddMatchOpen, setIsAddMatchOpen] = useState(false)
  const [isAddAlertOpen, setIsAddAlertOpen] = useState(false)
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false)
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false)
  const [isAddPatternOpen, setIsAddPatternOpen] = useState(false)
  const [isRegisteringMatch, setIsRegisteringMatch] = useState(false)
  
  const [riotVersion, setRiotVersion] = useState("14.3.1")
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [notes, setNotes] = useState<Note[]>([])

  // Form states
  const [formData, setFormData] = useState({
    patternTitle: "",
    patternDesc: "",
    patternType: "info" as Pattern["type"],
    alertTitle: "",
    alertDesc: "",
    alertPriority: "medium" as Alert["priority"],
    noteContent: "",
    noteCategory: "general" as Note["category"],
    matchId: "",
    matchTournament: "",
    matchNotes: ""
  })

  React.useEffect(() => {
    getLatestVersion().then(setRiotVersion)
  }, [])

  const handleAddPattern = () => {
    const newPattern: Pattern = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.patternTitle,
      description: formData.patternDesc,
      type: formData.patternType
    }
    setPatterns(prev => [newPattern, ...prev])
    setIsAddPatternOpen(false)
    setFormData({...formData, patternTitle: "", patternDesc: ""})
  }

  const handleAddAlert = () => {
    const newAlert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.alertTitle,
      description: formData.alertDesc,
      priority: formData.alertPriority,
      date: new Date().toLocaleDateString('pt-BR')
    }
    setAlerts(prev => [newAlert, ...prev])
    setIsAddAlertOpen(false)
    setFormData({...formData, alertTitle: "", alertDesc: ""})
  }

  const handleAddNote = () => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      content: formData.noteContent,
      author: "Analyst",
      timestamp: new Date().toLocaleDateString('pt-BR'),
      category: formData.noteCategory
    }
    setNotes(prev => [newNote, ...prev])
    setIsAddNoteOpen(false)
    setFormData({...formData, noteContent: ""})
  }

  const handleAddMatch = async () => {
    if (!formData.matchId || !team) return
    setIsRegisteringMatch(true)
    try {
       await registerMatch({
          teamId: team._id,
          matchId: formData.matchId,
          tournament: formData.matchTournament,
          notes: formData.matchNotes
       })
       toast.success("Partida registrada e processada com sucesso!")
       setIsAddMatchOpen(false)
       setFormData({ ...formData, matchId: "", matchTournament: "", matchNotes: "" })
    } catch (error) {
       console.error(error)
       toast.error("Erro ao registrar partida. Verifique o ID.")
    } finally {
       setIsRegisteringMatch(false)
    }
  }

  // New player form state
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    tag: "",
    region: "BR",
  })

  const [isAdding, setIsAdding] = useState(false)

  const handleAddPlayer = async () => {
    if (!newPlayer.name || !newPlayer.tag || !team) return
    setIsAdding(true)
    try {
      await addScoutedPlayer({
        teamId: teamId as Id<"scoutingTeams">,
        name: newPlayer.name,
        tagline: newPlayer.tag,
        region: newPlayer.region,
      })
      toast.success("Jogador adicionado! Agora ele será sincronizado.")
      setIsAddPlayerOpen(false)
      setNewPlayer({ name: "", tag: "", region: team.region || "BR" })
    } catch (e) {
      toast.error("Erro ao adicionar jogador")
    } finally {
      setIsAdding(false)
    }
  }

  if (!team) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/scouting">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Link>
      </Button>

      {/* Team Header */}
      <Card className="stat-card border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg" alt={team.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {team.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{team.name}</h1>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                    Tier {team.tier}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{team.region} Region</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Nova Nota
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Anotacao</DialogTitle>
                    <DialogDescription>
                      Adicione uma observacao sobre o time
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select 
                        value={formData.noteCategory}
                        onValueChange={(val: any) => setFormData({...formData, noteCategory: val})}
                      >
                        <SelectTrigger className="bg-muted/50">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tactical">Tática</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="behavior">Comportamento</SelectItem>
                          <SelectItem value="general">Geral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Conteúdo</Label>
                      <Textarea
                        placeholder="Descreva sua observação..."
                        className="bg-muted/50 resize-none"
                        rows={4}
                        value={formData.noteContent}
                        onChange={(e) => setFormData({...formData, noteContent: e.target.value})}
                      />
                    </div>
                    <Button className="w-full" onClick={handleAddNote} disabled={!formData.noteContent}>
                      Salvar Nota
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddPatternOpen} onOpenChange={setIsAddPatternOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Target className="mr-2 h-4 w-4" />
                    Novo Padrão
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Padrão Estratégico</DialogTitle>
                    <DialogDescription>
                      Documente um comportamento recorrente do time
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Tipo de Padrão</Label>
                      <Select 
                        value={formData.patternType}
                        onValueChange={(val: any) => setFormData({...formData, patternType: val})}
                      >
                        <SelectTrigger className="bg-muted/50">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="danger">Perigo (Vermelho)</SelectItem>
                          <SelectItem value="warning">Atenção (Amarelo)</SelectItem>
                          <SelectItem value="info">Informação (Azul)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input 
                        placeholder="Ex: Invade Nível 1" 
                        className="bg-muted/50" 
                        value={formData.patternTitle}
                        onChange={(e) => setFormData({...formData, patternTitle: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição Detalhada</Label>
                      <Textarea
                        placeholder="Descreva o comportamento observado..."
                        className="bg-muted/50 resize-none"
                        rows={3}
                        value={formData.patternDesc}
                        onChange={(e) => setFormData({...formData, patternDesc: e.target.value})}
                      />
                    </div>
                    <Button className="w-full" onClick={handleAddPattern} disabled={!formData.patternTitle || !formData.patternDesc}>
                      Registrar Padrão
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <MediaUploadModal 
                isOpen={isAddMediaOpen} 
                onOpenChange={setIsAddMediaOpen} 
                teamId={teamId as Id<"scoutingTeams">}
              />

              <Dialog open={isAddAlertOpen} onOpenChange={setIsAddAlertOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Novo Alerta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Alerta</DialogTitle>
                    <DialogDescription>
                      Registre uma mudanca importante observada
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Prioridade</Label>
                      <Select 
                        value={formData.alertPriority}
                        onValueChange={(val: any) => setFormData({...formData, alertPriority: val})}
                      >
                        <SelectTrigger className="bg-muted/50">
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="low">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Titulo</Label>
                      <Input 
                        placeholder="Ex: Mudanca de estrategia" 
                        className="bg-muted/50" 
                        value={formData.alertTitle}
                        onChange={(e) => setFormData({...formData, alertTitle: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descricao</Label>
                      <Textarea
                        placeholder="Descreva o alerta..."
                        className="bg-muted/50 resize-none"
                        rows={4}
                        value={formData.alertDesc}
                        onChange={(e) => setFormData({...formData, alertDesc: e.target.value})}
                      />
                    </div>
                    <Button className="w-full" onClick={handleAddAlert} disabled={!formData.alertTitle || !formData.alertDesc}>
                      Salvar Alerta
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-black font-bold">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Jogador
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Jogador ao Scouting</DialogTitle>
                    <DialogDescription>
                      Insira o Riot ID do jogador para iniciar o monitoramento automático.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 space-y-2">
                        <Label>Nick (Game Name)</Label>
                        <Input 
                          placeholder="Ex: Tinowns" 
                          className="bg-muted/50" 
                          value={newPlayer.name}
                          onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tagline</Label>
                        <Input 
                          placeholder="Ex: BR1" 
                          className="bg-muted/50" 
                          value={newPlayer.tag}
                          onChange={(e) => setNewPlayer({ ...newPlayer, tag: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Região de Cadastro</Label>
                      <Select value={newPlayer.region} onValueChange={(v) => setNewPlayer({ ...newPlayer, region: v })}>
                        <SelectTrigger className="bg-muted/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/10 text-white">
                          <SelectItem value="BR">Brasil (BR)</SelectItem>
                          <SelectItem value="NA">North America (NA)</SelectItem>
                          <SelectItem value="EUW">Europe West (EUW)</SelectItem>
                          <SelectItem value="KR">Korea (KR)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground">Isso define o servidor da Riot onde buscaremos os dados.</p>
                    </div>
                    <Button 
                      className="w-full h-12 font-bold uppercase tracking-widest" 
                      onClick={handleAddPlayer}
                      disabled={isAdding || !newPlayer.name || !newPlayer.tag}
                    >
                      {isAdding ? <Loader2 className="animate-spin mr-2" /> : <Swords className="mr-2 h-4 w-4" />}
                      Iniciar Scouting
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddMatchOpen} onOpenChange={setIsAddMatchOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Partida
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Partida Oficial</DialogTitle>
                    <DialogDescription>
                      Adicione uma partida para análise via ID da Riot
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>ID da Partida</Label>
                      <Input 
                        placeholder="Ex: BR1_123456789" 
                        className="bg-muted/50" 
                        value={formData.matchId}
                        onChange={(e) => setFormData({...formData, matchId: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">
                        Encontre o ID na API do Riot ou em sites como op.gg
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Torneio</Label>
                      <Input 
                        placeholder="Ex: CBLOL 2026" 
                        className="bg-muted/50" 
                        value={formData.matchTournament}
                        onChange={(e) => setFormData({...formData, matchTournament: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notas (opcional)</Label>
                      <Textarea
                        placeholder="Observações sobre a partida..."
                        className="bg-muted/50 resize-none"
                        rows={3}
                        value={formData.matchNotes}
                        onChange={(e) => setFormData({...formData, matchNotes: e.target.value})}
                      />
                    </div>
                    <Button className="w-full" onClick={handleAddMatch} disabled={!formData.matchId || isRegisteringMatch}>
                      {isRegisteringMatch ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Registrar"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Win Rate" value={`${team.winRate || 0}%`} icon={TrendingUp} iconColor="text-green-500" />
        <StatCard title="Tempo Medio" value="--" icon={Clock} iconColor="text-chart-2" />
        <StatCard title="Blue Side" value="--" icon={Shield} iconColor="text-blue-500" />
        <StatCard title="Red Side" value="--" icon={Target} iconColor="text-red-500" />
        <StatCard title="First Blood" value="--" icon={Swords} iconColor="text-yellow-500" />
      </div>

      <PageNav tabs={scoutingDetailTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Alerts */}
            <Card className="stat-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Alertas Recentes
                </CardTitle>
                <CardDescription>Mudancas importantes observadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-4 ${
                      alert.priority === "high"
                        ? "border-red-500/30 bg-red-500/5"
                        : alert.priority === "medium"
                        ? "border-yellow-500/30 bg-yellow-500/5"
                        : "border-blue-500/30 bg-blue-500/5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{alert.title}</p>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] ${
                              alert.priority === "high" ? "text-red-500" :
                              alert.priority === "medium" ? "text-yellow-500" : "text-blue-500"
                            }`}
                          >
                            {alert.priority === "high" ? "Alta" : 
                             alert.priority === "medium" ? "Media" : "Baixa"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{alert.date}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Key Patterns */}
            <Card className="stat-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5 text-primary" />
                  Padroes Chave
                </CardTitle>
                <CardDescription>Comportamentos identificados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {patterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className={`rounded-lg border p-4 ${
                      pattern.type === "danger"
                        ? "border-red-500/30 bg-red-500/5"
                        : pattern.type === "warning"
                        ? "border-yellow-500/30 bg-yellow-500/5"
                        : "border-blue-500/30 bg-blue-500/5"
                    }`}
                  >
                    <p className="font-medium">{pattern.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{pattern.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Media */}
          <Card className="stat-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Midia Recente</CardTitle>
                <CardDescription>Ultimos arquivos adicionados</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("media")}>
                Ver tudo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {mediaItems && mediaItems.length > 0 ? (
                  mediaItems.slice(0, 4).map((item) => (
                    <div key={item._id} className="group relative rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden aspect-video">
                       {item.type === "youtube" ? (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                           <Youtube className="w-8 h-8 text-red-600" />
                         </div>
                       ) : item.url ? (
                         <img src={item.url} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                       ) : (
                         <div className="absolute inset-0 flex items-center justify-center">
                           <ImageIcon className="w-6 h-6 text-muted-foreground/20" />
                         </div>
                       )}
                       <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-[9px] font-black uppercase tracking-tight line-clamp-1">{item.title}</p>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-10 text-center border border-dashed border-border/50 rounded-lg">
                    <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest opacity-40">Nenhuma mídia recente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Players Tab */}
      {activeTab === "players" && (
        <div className="space-y-6">
          {/* Player List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {players?.map((player) => (
              <Card 
                key={player._id} 
                className="stat-card border-border/50 cursor-pointer hover:border-primary/50 transition-colors" 
                onClick={() => window.location.href = `/scouting/${teamId}/player/${player._id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`https://ddragon.leagueoflegends.com/cdn/${riotVersion}/img/profileicon/0.png`} alt={player.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {player.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="font-bold">{player.name}</p>
                        <span className="text-[10px] opacity-40 font-mono">#{player.tagline}</span>
                      </div>
                      <p className="text-sm text-muted-foreground uppercase font-black text-[10px] tracking-widest opacity-60">JOGADOR MONITORADO</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>WR: {player.winRate || 0}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="truncate">Rank: {player.rank || "UNRANKED"} {player.tier}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span>LP: {player.lp || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <History className="h-4 w-4 text-purple-500" />
                      <span>Jogos: {player.games || 0}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Última Sincronização:
                    </p>
                    <p className="text-xs font-mono font-bold opacity-60">
                      {player.lastUpdated ? new Date(player.lastUpdated).toLocaleString('pt-BR') : "Nunca"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Player Notes Dialog */}
          <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
            <DialogContent className="max-w-2xl">
              {selectedPlayer && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      Notas sobre {selectedPlayer.name}
                      <Badge variant="outline">{selectedPlayer.role}</Badge>
                    </DialogTitle>
                    <DialogDescription>
                      Anotacoes especificas sobre este jogador
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[60vh]">
                    <div className="py-10 text-center border border-dashed border-border/50 rounded-lg">
                      <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest opacity-40">Integração de notas em breve</p>
                    </div>
                  </ScrollArea>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Patterns Tab */}
      {activeTab === "patterns" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="stat-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg text-red-500">Perigos</CardTitle>
                <CardDescription>Pontos fortes do adversario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {patterns
                  .filter((p) => p.type === "danger")
                  .map((pattern) => (
                    <div
                      key={pattern.id}
                      className="rounded-lg border border-red-500/30 bg-red-500/5 p-4"
                    >
                      <p className="font-medium">{pattern.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{pattern.description}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="stat-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-500">Atencao</CardTitle>
                <CardDescription>Tendencias a observar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {patterns
                  .filter((p) => p.type === "warning")
                  .map((pattern) => (
                    <div
                      key={pattern.id}
                      className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4"
                    >
                      <p className="font-medium">{pattern.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{pattern.description}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          <Card className="stat-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-500">Informacoes Gerais</CardTitle>
              <CardDescription>Observacoes sobre estilo de jogo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {patterns
                .filter((p) => p.type === "info")
                .map((pattern) => (
                  <div
                    key={pattern.id}
                    className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4"
                  >
                    <p className="font-medium">{pattern.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{pattern.description}</p>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Media Tab */}
      {activeTab === "media" && (
        <div className="space-y-6">
          <Card className="stat-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-5 w-5 text-primary" />
                Galeria de Midia
              </CardTitle>
              <CardDescription>
                Imagens, prints, videos e links relacionados ao time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaGallery 
                media={mediaItems || []} 
                onAdd={() => setIsAddMediaOpen(true)} 
                onDelete={(id) => deleteMedia({ id })}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Matches Tab */}
      {/* Matches Tab */}
      {activeTab === "matches" && (
         <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-black uppercase tracking-tight">Histórico de Partidas</h3>
               <Button onClick={() => setIsAddMatchOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Partida
               </Button>
            </div>
            
            <div className="space-y-4">
               {matches?.map((match: any) => (
                  <TeamMatchCard key={match._id} match={match} riotVersion={riotVersion} />
               ))}
               {matches?.length === 0 && (
                  <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-[2rem]">
                     <History className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                     <p className="text-muted-foreground font-medium">Nenhuma partida registrada.</p>
                  </div>
               )}
            </div>
         </div>
      )}

      {/* Notes Tab */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          <Card className="stat-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Anotacoes do Time
              </CardTitle>
              <CardDescription>
                Observacoes gerais sobre o time e seu estilo de jogo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotesSection 
                notes={notes} 
                onAdd={() => setIsAddNoteOpen(true)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}


function TeamMatchCard({ match, riotVersion }: { match: any, riotVersion: string }) {
   const [expanded, setExpanded] = useState(false)
   const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
   
   const date = new Date(match.date).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' })
   const duration = `${Math.floor(match.duration / 60)}:${(match.duration % 60).toString().padStart(2, '0')}`

   // Helper to find enemy counterpart
   const getOpponent = (role: string) => match.enemyTeam.find((p: any) => p.role === role)

   const ROLES = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"]
   // Using reliable raw.communitydragon.org assets for consistency
   const ROLE_ICONS: Record<string, string> = {
      "TOP": "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-top.svg",
      "JUNGLE": "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-jungle.svg",
      "MIDDLE": "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-middle.svg",
      "BOTTOM": "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-bottom.svg",
      "UTILITY": "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-utility.svg"
   }

   // Robust aggregations with fallback to 0
   const totalKills = match.myTeam?.reduce((a: any, b: any) => a + (Number(b.kills) || 0), 0) || 0;
   const totalDeaths = match.myTeam?.reduce((a: any, b: any) => a + (Number(b.deaths) || 0), 0) || 0;

   // Normalized Objectives
   const dragons = match.objectives?.dragons || 0;
   const barons = match.objectives?.barons || 0;

   return (
      <>
         <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-all">
            {/* Header / Summary */}
            <div 
               className="flex items-center p-4 gap-6 cursor-pointer"
               onClick={() => setExpanded(!expanded)}
            >
               <div className={cn("w-2 h-16 rounded-full shrink-0", match.win ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]")} />
               
               <div className="w-24 text-center">
                  <p className={cn("text-lg font-black uppercase tracking-tighter", match.win ? "text-emerald-400" : "text-red-400")}>
                     {match.win ? "Vitória" : "Derrota"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold">{date}</p>
               </div>

               {/* Quick Comp Preview (Collapsed) */}
               {!expanded && (
                  <div className="flex-1 grid grid-cols-2 gap-8 animate-in fade-in">
                     <div className="flex justify-center gap-1">
                        {match.myTeam.map((p: any) => (
                           <Avatar key={p.puuid} className="w-8 h-8 rounded-lg border border-white/10">
                              <AvatarImage src={getChampionIcon(p.championName, riotVersion)} />
                           </Avatar>
                        ))}
                     </div>
                     <div className="flex justify-center gap-1">
                        {match.enemyTeam.map((p: any) => (
                           <Avatar key={p.puuid} className="w-8 h-8 rounded-lg border border-white/10 grayscale opacity-60">
                              <AvatarImage src={getChampionIcon(p.championName, riotVersion)} />
                           </Avatar>
                        ))}
                     </div>
                  </div>
               )}

               {/* Stats Summary (Expanded) */}
               {expanded && (
                   <div className="flex-1 grid grid-cols-3 gap-4 text-center animate-in fade-in">
                        <div>
                           <p className="text-[10px] uppercase text-muted-foreground font-bold">Gold Total</p>
                           <p className={cn("text-sm font-black", match.snapshots?.["20m"]?.goldDiff > 0 ? "text-emerald-400" : "text-red-400")}>
                              {match.snapshots?.["20m"]?.goldDiff > 0 ? "+" : ""}{(match.snapshots?.["20m"]?.goldDiff / 1000).toFixed(1)}k @ 20m
                           </p>
                        </div>
                        <div>
                           <p className="text-[10px] uppercase text-muted-foreground font-bold">Kills</p>
                           <p className="text-sm font-black text-white">
                              {totalKills} - {totalDeaths}
                           </p>
                        </div>
                        <div>
                           <p className="text-[10px] uppercase text-muted-foreground font-bold">Objetivos</p>
                           <p className="text-sm font-black text-amber-400">
                             {dragons} Drags / {barons} Barons
                           </p>
                        </div>
                   </div>
               )}

               <div className="text-right space-y-1 min-w-[120px]">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">{match.tournament || "Scrim"}</p>
                  <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground/60 font-mono">
                     <Clock className="w-3 h-3" /> {duration}
                  </div>
               </div>

               <Button variant="ghost" size="icon" className="rounded-full">
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
               </Button>
            </div>

            {expanded && (
               <div className="border-t border-white/5 bg-black/20 p-6 space-y-8 animate-in slide-in-from-top-2">
                   {/* Context & Notes */}
                   {match.notes && (
                     <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex gap-3 text-amber-200/80 text-sm">
                        <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>{match.notes}</p>
                     </div>
                  )}

                  {/* Lane Matchups & Stats Table */}
                  <div className="space-y-2">
                     <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-2 px-2 text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center">
                        <div className="text-left">Nossa Equipe</div>
                        <div>Lane Matchup</div>
                        <div className="text-right">Inimigo</div>
                     </div>
                     
                     {ROLES.map(role => {
                        const myPlayer = match.myTeam.find((p: any) => p.role === role) || match.myTeam.find((p: any) => p.role === "INVALID")
                        const enemyPlayer = getOpponent(role)
                        
                        // Calculated Diffs
                        const goldDiff = myPlayer && enemyPlayer ? myPlayer.gold - enemyPlayer.gold : 0
                        const xpDiff = myPlayer && enemyPlayer ? (myPlayer.xp || 0) - (enemyPlayer.xp || 0) : 0
                        const csDiff = myPlayer && enemyPlayer ? myPlayer.cs - enemyPlayer.cs : 0

                        return (
                           <div key={role} className="grid grid-cols-[1fr_auto_1fr] gap-4 bg-white/5 rounded-xl border border-white/5 p-2 items-center hover:bg-white/10 transition-colors group">
                                 
                                 {/* My Player */}
                                 <div 
                                    className="flex items-center gap-3 cursor-pointer"
                                    onClick={() => setSelectedPlayer(myPlayer)}
                                 >
                                    <div className="relative">
                                       <Avatar className="w-10 h-10 rounded-lg border border-white/10">
                                          <AvatarImage src={getChampionIcon(myPlayer?.championName, riotVersion)} />
                                       </Avatar>
                                       <div className="absolute -bottom-1 -right-1 bg-black/80 text-[9px] px-1 rounded border border-white/10 font-mono">
                                          {myPlayer?.level || 1}
                                       </div>
                                    </div>
                                    <div className="min-w-0">
                                       <p className="text-xs font-bold truncate text-white">{myPlayer?.riotIdGameName}</p>
                                       <p className="text-[10px] text-muted-foreground font-mono">{myPlayer?.kda} KDA</p>
                                    </div>
                                    <div className="flex gap-0.5 ml-auto">
                                       {myPlayer?.items.slice(0, 3).map((item: number, idx: number) => (
                                          item ? <img key={idx} src={getItemIcon(item, riotVersion)} className="w-5 h-5 rounded border border-white/10" /> : <div key={idx} className="w-5 h-5" />
                                       ))}
                                    </div>
                                 </div>

                                 {/* Comparison Center */}
                                 <div className="w-32 flex flex-col items-center justify-center gap-1">
                                       <img src={ROLE_ICONS[role]} className="w-5 h-5 opacity-20 filter invert" />
                                       
                                       <div className="flex flex-col gap-0.5 w-full">
                                          {/* Gold Diff */}
                                          <div className="flex justify-between w-full text-[9px] font-mono bg-black/40 rounded px-1.5 py-0.5">
                                             <span className={cn(goldDiff > 0 ? "text-emerald-400" : "text-red-400")}>
                                                {goldDiff > 0 ? "+" : ""}{(goldDiff/1000).toFixed(1)}k
                                             </span>
                                             <span className="text-muted-foreground">GD</span>
                                          </div>
                                          {/* CS Diff */}
                                          <div className="flex justify-between w-full text-[9px] font-mono bg-black/40 rounded px-1.5 py-0.5">
                                             <span className={cn(csDiff > 0 ? "text-emerald-400" : "text-red-400")}>
                                                {csDiff > 0 ? "+" : ""}{csDiff}
                                             </span>
                                             <span className="text-muted-foreground">CS</span>
                                          </div>
                                          {/* XP Diff */}
                                          <div className="flex justify-between w-full text-[9px] font-mono bg-black/40 rounded px-1.5 py-0.5">
                                             <span className={cn(xpDiff > 0 ? "text-emerald-400" : "text-red-400")}>
                                                {xpDiff > 0 ? "+" : ""}{xpDiff}
                                             </span>
                                             <span className="text-muted-foreground">XP</span>
                                          </div>
                                       </div>
                                 </div>

                                 {/* Enemy Player */}
                                 <div 
                                    className="flex items-center gap-3 justify-end cursor-pointer text-right"
                                    onClick={() => setSelectedPlayer(enemyPlayer)}
                                 >
                                    <div className="flex gap-0.5 mr-auto">
                                       {enemyPlayer?.items.slice(0, 3).map((item: number, idx: number) => (
                                          item ? <img key={idx} src={getItemIcon(item, riotVersion)} className="w-5 h-5 rounded border border-white/10" /> : <div key={idx} className="w-5 h-5" />
                                       ))}
                                    </div>
                                    <div className="min-w-0">
                                       <p className="text-xs font-bold truncate text-white">{enemyPlayer?.riotIdGameName}</p>
                                       <p className="text-[10px] text-muted-foreground font-mono">{enemyPlayer?.kda} KDA</p>
                                    </div>
                                    <div className="relative">
                                       <Avatar className="w-10 h-10 rounded-lg border border-white/10 opacity-70 grayscale">
                                          <AvatarImage src={getChampionIcon(enemyPlayer?.championName, riotVersion)} />
                                       </Avatar>
                                       <div className="absolute -bottom-1 -left-1 bg-black/80 text-[9px] px-1 rounded border border-white/10 font-mono">
                                          {enemyPlayer?.level || 1}
                                       </div>
                                    </div>
                                 </div>
                           </div>
                        )
                     })}
                  </div>

                  {/* Snapshots / Timeline */}
                   <div className="grid grid-cols-3 gap-4">
                     {Object.entries(match.snapshots || {}).map(([time, data]: [string, any]) => (
                        <div key={time} className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-4">
                           <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{time} Snapshot</p>
                              <Badge variant={data.goldDiff > 0 ? "default" : "destructive"} className="text-[10px]">
                                 {data.goldDiff > 0 ? "+" : ""}{(data.goldDiff / 1000).toFixed(1)}k Gold
                              </Badge>
                           </div>
                           
                           <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                 <span className="text-muted-foreground">Kills</span>
                                 <span className="font-bold flex gap-1">
                                    <span className="text-emerald-400">{data.kills}</span> / <span className="text-red-400">{data.deaths}</span>
                                 </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                 <span className="text-muted-foreground">Dragões</span>
                                 <span className="font-bold text-amber-400">{data.objectives.dragons} vs {data.enemyObjectives.dragons}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                 <span className="text-muted-foreground">Torres</span>
                                 <span className="font-bold text-blue-400">{data.objectives.towers} vs {data.enemyObjectives.towers}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>

               </div>
            )}
         </div>

         {/* Detailed Player Dialog */}
         <Dialog open={!!selectedPlayer} onOpenChange={(o) => !o && setSelectedPlayer(null)}>
            <DialogContent className="max-w-2xl bg-[#0a0a0a] border-white/10 text-white">
               {selectedPlayer && (
                  <>
                     <DialogHeader>
                        <DialogTitle className="flex items-center gap-4">
                            <Avatar className="w-16 h-16 rounded-xl border-2 border-white/10">
                              <AvatarImage src={getChampionIcon(selectedPlayer.championName, riotVersion)} />
                           </Avatar>
                           <div>
                              <div className="flex items-center gap-2">
                                 <h2 className="text-2xl font-black uppercase tracking-tighter">{selectedPlayer.championName}</h2>
                                 <Badge variant="outline" className="text-[10px] ml-2">{selectedPlayer.role}</Badge>
                              </div>
                              <p className="text-muted-foreground">{selectedPlayer.riotIdGameName} #{selectedPlayer.riotIdTagline}</p>
                           </div>
                        </DialogTitle>
                     </DialogHeader>
                     
                     <div className="grid grid-cols-2 gap-8 py-6">
                         {/* Combat Stats */}
                         <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Combate & Build</h4>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                  <p className="text-[10px] uppercase text-muted-foreground">KDA</p>
                                  <p className="text-xl font-black">{selectedPlayer.kda}</p>
                                  <p className="text-[10px] text-muted-foreground">{selectedPlayer.kills} / {selectedPlayer.deaths} / {selectedPlayer.assists}</p>
                               </div>
                               <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                  <p className="text-[10px] uppercase text-muted-foreground">Dano Total</p>
                                  <p className="text-xl font-black text-red-300">{(selectedPlayer.damage / 1000).toFixed(1)}k</p>
                                  <p className="text-[10px] text-muted-foreground">{(selectedPlayer.damageShare || 0).toFixed(1)}% do time</p>
                               </div>
                               <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                  <p className="text-[10px] uppercase text-muted-foreground">DPM</p>
                                  <p className="text-xl font-black text-orange-300">{(selectedPlayer.dpm || 0).toFixed(0)}</p>
                               </div>
                               <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                  <p className="text-[10px] uppercase text-muted-foreground">Gold / Dano</p>
                                  <p className="text-xl font-black text-yellow-100">{(selectedPlayer.goldPerDamage || 0).toFixed(2)}</p>
                               </div>
                            </div>
                            
                            <div>
                               <p className="text-[10px] uppercase text-muted-foreground mb-2">Items</p>
                               <div className="flex gap-2 flex-wrap">
                                  {selectedPlayer.items.map((item: number, i: number) => (
                                     item ? <img key={i} src={getItemIcon(item, riotVersion)} className="w-10 h-10 rounded border border-white/10 shrink-0" /> : <div key={i} className="w-10 h-10 bg-white/5 rounded border border-white/5 shrink-0" />
                                  ))}
                               </div>
                            </div>
                         </div>

                         {/* Economy & Vision */}
                         <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Economia & Visão</h4>
                            <div className="space-y-2">
                               <div className="flex justify-between p-2 hover:bg-white/5 rounded transition-colors">
                                  <span className="text-sm text-muted-foreground">Gold Total</span>
                                  <div className="text-right">
                                    <span className="block font-bold text-amber-300">{(selectedPlayer.gold / 1000).toFixed(1)}k</span>
                                    <span className="text-[10px] text-muted-foreground">{(selectedPlayer.goldShare || 0).toFixed(1)}% share</span>
                                  </div>
                               </div>
                               <div className="flex justify-between p-2 hover:bg-white/5 rounded transition-colors">
                                  <span className="text-sm text-muted-foreground">GPM</span>
                                  <span className="font-bold text-amber-200">{(selectedPlayer.gpm || 0).toFixed(0)}</span>
                               </div>
                               <div className="flex justify-between p-2 hover:bg-white/5 rounded transition-colors">
                                  <span className="text-sm text-muted-foreground">CS Total</span>
                                  <span className="font-bold text-blue-300">{selectedPlayer.cs} <span className="text-[10px] text-muted-foreground">({(selectedPlayer.cspm || 0).toFixed(1)}/min)</span></span>
                               </div>
                               <div className="flex justify-between p-2 hover:bg-white/5 rounded transition-colors">
                                  <span className="text-sm text-muted-foreground">Vision Score</span>
                                  <div className="text-right">
                                     <span className="block font-bold text-purple-300">{selectedPlayer.vision || 0}</span>
                                     <span className="text-[10px] text-muted-foreground">{(selectedPlayer.vspm || 0).toFixed(2)}/min • {(selectedPlayer.visionShare || 0).toFixed(1)}%</span>
                                  </div>
                               </div>
                                <div className="flex justify-between p-2 hover:bg-white/5 rounded transition-colors">
                                  <span className="text-sm text-muted-foreground">Wards (Placed/Killed)</span>
                                  <span className="font-bold">{selectedPlayer.wardsPlaced || 0} / {selectedPlayer.wardsKilled || 0}</span>
                               </div>
                               <div className="flex justify-between p-2 hover:bg-white/5 rounded transition-colors">
                                  <span className="text-sm text-muted-foreground">Control Wards</span>
                                  <span className="font-bold text-pink-300">{selectedPlayer.visionWardsBoughtInGame || 0}</span>
                               </div>
                            </div>
                         </div>
                     </div>
                  </>
               )}
            </DialogContent>
         </Dialog>
      </>
   )
}

