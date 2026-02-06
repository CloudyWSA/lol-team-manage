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
import { useQuery, useMutation } from "convex/react"
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
  const addScoutedPlayer = useMutation(api.scouting.addScoutedPlayer)
  const deleteMedia = useMutation(api.media.deleteMedia)

  // Dialog visibility states
  const [isAddMatchOpen, setIsAddMatchOpen] = useState(false)
  const [isAddAlertOpen, setIsAddAlertOpen] = useState(false)
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false)
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false)
  const [isAddPatternOpen, setIsAddPatternOpen] = useState(false)
  
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

  const matches: any[] = []

  const handleAddMatch = () => {
    setIsAddMatchOpen(false)
    toast.info("Match analysis functionality coming soon")
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
                    <Button className="w-full" onClick={handleAddMatch} disabled={!formData.matchId || !formData.matchTournament}>
                      Registrar
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
      {activeTab === "matches" && (
        <div className="space-y-4">
          <Card className="stat-card border-border/50 bg-black/40 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tighter">Histórico de Partidas 2.0</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-40">Series Oficiais e Breakdown de Games</CardDescription>
              </div>
              <Button onClick={() => setIsAddMatchOpen(true)} className="h-9 text-[10px] font-bold uppercase tracking-widest px-6 shadow-xl shadow-primary/10">
                <Plus className="mr-2 h-4 w-4" /> Registrar Série
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                {matches.map((match) => (
                  <AccordionItem key={match.id} value={match.id} className="border-b border-white/5 px-6">
                    <AccordionTrigger className="hover:no-underline py-6">
                      <div className="flex items-center justify-between w-full pr-6 text-left">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-2xl font-black text-xl shadow-inner",
                            match.result === "W" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          )}>
                            {match.result}
                          </div>
                          <div>
                            <p className="font-black text-lg uppercase tracking-tight">vs. {match.opponent}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="bg-white/5 text-[10px] font-mono border-white/10 uppercase">{match.score}</Badge>
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">{match.tournament}</span>
                            </div>
                          </div>
                        </div>
                        <div className="hidden md:block text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{match.date}</p>
                          <p className="text-[9px] font-mono opacity-20">{match.id}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-8">
                      {match.games.length > 0 ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                          {match.games.map((game, idx) => (
                            <div key={game.id} className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                              <div className="bg-white/[0.03] px-4 py-2 flex items-center justify-between border-b border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">GAME {idx + 1} • {game.duration}</span>
                                <Badge variant={game.win ? "default" : "destructive"} className="h-5 text-[9px] font-black px-3 rounded-full">
                                  {game.win ? "VITÓRIA" : "DERROTA"}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 xl:grid-cols-2">
                                {/* Blue Side */}
                                <div className="p-4 border-r border-white/5 bg-blue-500/[0.02]">
                                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4 opacity-70">Blue Side • {idx === 0 ? team.name : match.opponent}</p>
                                  <div className="space-y-2">
                                    {game.blueTeam.map((p, pIdx) => (
                                      <div key={pIdx} className="flex items-center justify-between group/p hover:bg-white/[0.03] p-1.5 rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                          <div className="relative">
                                            <Avatar className="h-9 w-9 border border-white/10 shadow-lg">
                                              <AvatarImage src={getChampionIcon(p.champion, riotVersion)} />
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 border border-white/20">
                                              {/* Placeholder for role icon */}
                                              <span className="text-[7px] font-black uppercase px-1 text-white/60">{p.role[0]}</span>
                                            </div>
                                          </div>
                                          <div>
                                            <p className="text-[10px] font-black line-clamp-1">{p.champion}</p>
                                            <p className="text-[9px] font-mono opacity-40">{p.kda}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <div className="flex gap-0.5">
                                            {p.items.map((item, iIdx) => (
                                              <div key={iIdx} className="w-5 h-5 bg-black/40 rounded-sm border border-white/5 overflow-hidden flex items-center justify-center">
                                                {item ? (
                                                  <img src={getItemIcon(item, riotVersion)} alt="item" className="w-full h-full scale-110" />
                                                ) : <div className="w-full h-full bg-white/[0.02]" />}
                                              </div>
                                            ))}
                                          </div>
                                          <div className="text-right w-12 shrink-0">
                                            <p className="text-[9px] font-black">{p.gold}</p>
                                            <p className="text-[8px] font-mono opacity-40">{p.cs} CS</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {/* Red Side */}
                                <div className="p-4 bg-red-500/[0.02]">
                                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400 mb-4 opacity-70">Red Side • {idx === 0 ? match.opponent : team.name}</p>
                                  <div className="space-y-2">
                                    {game.redTeam.map((p, pIdx) => (
                                      <div key={pIdx} className="flex items-center justify-between group/p hover:bg-white/[0.03] p-1.5 rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                          <div className="relative">
                                            <Avatar className="h-9 w-9 border border-white/10 shadow-lg">
                                              <AvatarImage src={getChampionIcon(p.champion, riotVersion)} />
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 border border-white/20">
                                              <span className="text-[7px] font-black uppercase px-1 text-white/60">{p.role[0]}</span>
                                            </div>
                                          </div>
                                          <div>
                                            <p className="text-[10px] font-black line-clamp-1">{p.champion}</p>
                                            <p className="text-[9px] font-mono opacity-40">{p.kda}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <div className="flex gap-0.5">
                                            {p.items.map((item, iIdx) => (
                                              <div key={iIdx} className="w-5 h-5 bg-black/40 rounded-sm border border-white/5 overflow-hidden flex items-center justify-center">
                                                {item ? (
                                                  <img src={getItemIcon(item, riotVersion)} alt="item" className="w-full h-full scale-110" />
                                                ) : <div className="w-full h-full bg-white/[0.02]" />}
                                              </div>
                                            ))}
                                          </div>
                                          <div className="text-right w-12 shrink-0">
                                            <p className="text-[9px] font-black">{p.gold}</p>
                                            <p className="text-[8px] font-mono opacity-40">{p.cs} CS</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                          <History className="h-8 w-8 text-white/10 mx-auto mb-3" />
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Nenhum detalhe de game disponível para esta série</p>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
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
