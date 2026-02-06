"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PageNav, type PageNavTab } from "@/components/ui/page-nav"
import {
  Calendar,
  Clock,
  Plus,
  Swords,
  ChevronRight,
  MapPin,
  Users,
  Star,
  FileText,
  History,
  BarChart3,
  TrendingUp,
  Filter,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@/lib/auth-context"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"

const scrimsTabs: PageNavTab[] = [
  { id: "upcoming", label: "Próximos", icon: Calendar },
  { id: "history", label: "Histórico", icon: History },
  { id: "teams", label: "Times", icon: Users },
  { id: "analysis", label: "Análise", icon: BarChart3 },
]

export function ScrimsContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [selectedSeries, setSelectedSeries] = useState<Id<"scrims"> | null>(null)
  
  const [newScrim, setNewScrim] = useState({
    opponent: "",
    date: "",
    time: "",
    format: "BO3" as "BO1" | "BO3" | "BO5",
    server: "BR",
    notes: ""
  })

  // Convex Queries
  const allScrims = useQuery(api.scrims.listByTeam, user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip")
  const completedScrims = useQuery(api.scrims.listCompleted, user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip")
  
  // Convex Mutations
  const createScrim = useMutation(api.scrims.create)

  const upcomingScrims = allScrims?.filter(s => s.status !== "concluido") || []
  const recentScrims = completedScrims || []

  // Stats calculation
  const totalScrims = allScrims?.length || 0
  const wonScrims = completedScrims?.filter(s => s.won).length || 0
  const winRate = totalScrims > 0 ? Math.round((wonScrims / (completedScrims?.length || 1)) * 100) : 0

  const handleCreateScrim = async () => {
    if (!newScrim.opponent || !newScrim.date || !newScrim.time || !user?.teamId) return
    
    try {
      await createScrim({
        ...newScrim,
        teamId: user.teamId as Id<"teams">,
        status: "confirmado",
        date: newScrim.date.split("-").reverse().join("/")
      })
      
      toast.success("Scrim agendado!")
      setIsDialogOpen(false)
      setNewScrim({
        opponent: "",
        date: "",
        time: "",
        format: "BO3",
        server: "BR",
        notes: ""
      })
    } catch (error) {
      toast.error("Erro ao agendar scrim")
    }
  }

  if (!allScrims) return <div className="flex h-60 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard title="Total de Scrims" value={totalScrims.toString()} subtitle="Geral" />
        <StatsCard 
          title="Win Rate" 
          value={`${winRate}%`} 
          subtitle="Histórico"
          highlight
        />
        <StatsCard title="Próximas" value={upcomingScrims.length.toString()} subtitle="Agendas" />
        <StatsCard title="Blue Side" value="--" subtitle="Análise pendente" />
        <StatsCard title="Red Side" value="--" subtitle="Análise pendente" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageNav tabs={scrimsTabs} activeTab={activeTab} onTabChange={setActiveTab} className="sm:w-auto" />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agendar Scrim
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Agendar Novo Scrim</DialogTitle>
              <DialogDescription>
                Preencha os detalhes do treino
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Time adversario</Label>
                <Input 
                  placeholder="Nome do time" 
                  className="bg-muted/50" 
                  value={newScrim.opponent}
                  onChange={(e) => setNewScrim({ ...newScrim, opponent: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input 
                    type="date" 
                    className="bg-muted/50" 
                    value={newScrim.date}
                    onChange={(e) => setNewScrim({ ...newScrim, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horario</Label>
                  <Input 
                    type="time" 
                    className="bg-muted/50" 
                    value={newScrim.time}
                    onChange={(e) => setNewScrim({ ...newScrim, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select 
                    value={newScrim.format} 
                    onValueChange={(v: any) => setNewScrim({ ...newScrim, format: v })}
                  >
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BO1">BO1</SelectItem>
                      <SelectItem value="BO3">BO3</SelectItem>
                      <SelectItem value="BO5">BO5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Servidor</Label>
                  <Select 
                    value={newScrim.server} 
                    onValueChange={(v) => setNewScrim({ ...newScrim, server: v })}
                  >
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BR">Brasil</SelectItem>
                      <SelectItem value="NA">NA</SelectItem>
                      <SelectItem value="EUW">EUW</SelectItem>
                      <SelectItem value="KR">Korea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea 
                  placeholder="Objetivos, foco especifico..."
                  className="bg-muted/50 resize-none"
                  rows={3}
                  value={newScrim.notes}
                  onChange={(e) => setNewScrim({ ...newScrim, notes: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleCreateScrim}>
                <Calendar className="mr-2 h-4 w-4" />
                Agendar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activeTab === "upcoming" && (
        <div className="space-y-4">
          {upcomingScrims.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl opacity-50">
              <Calendar className="h-8 w-8 mb-2" />
              <p className="text-sm font-medium">Nenhum scrim agendado</p>
            </div>
          )}
          {upcomingScrims.map((scrim) => (
            <Link key={scrim._id} href={`/scrims/${scrim._id}`}>
              <Card className="stat-card border-border/50 hover:border-primary/50 transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-1/10">
                        <Swords className="h-6 w-6 text-chart-1" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">vs. {scrim.opponent}</h3>
                          <Badge
                            variant={scrim.status === "confirmado" ? "default" : "outline"}
                            className="text-xs"
                          >
                            {scrim.status}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {scrim.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {scrim.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {scrim.server}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant="secondary">{scrim.format}</Badge>
                        {scrim.notes && (
                          <p className="mt-1 text-xs text-muted-foreground">{scrim.notes}</p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Input 
                placeholder="Buscar por time..."
                className="bg-muted/50"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {recentScrims.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl opacity-50">
              <History className="h-8 w-8 mb-2" />
              <p className="text-sm font-medium">Nenhum histórico encontrado</p>
            </div>
          )}

          {recentScrims.map((scrim) => (
            <Link key={scrim._id} href={`/scrims/${scrim._id}`}>
              <Card className="stat-card border-border/50 hover:border-primary/50 transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg font-bold ${
                          scrim.won ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {scrim.won ? "W" : "L"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">vs. {scrim.opponent}</h3>
                          <Badge variant="secondary">{scrim.result}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{scrim.date}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= (scrim.rating || 0)
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      {scrim.notes && (
                        <p className="max-w-48 text-right text-xs text-muted-foreground">
                          {scrim.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "teams" && (
        <div className="flex flex-col items-center justify-center h-60 border-2 border-dashed rounded-3xl opacity-50">
          <Users className="h-10 w-10 mb-2" />
          <p className="font-bold">Análise de times em desenvolvimento</p>
          <p className="text-xs">Este módulo será populado automaticamente com base no histórico</p>
        </div>
      )}

      {activeTab === "analysis" && (
        <div className="flex flex-col items-center justify-center h-60 border-2 border-dashed rounded-3xl opacity-50">
          <BarChart3 className="h-10 w-10 mb-2" />
          <p className="font-bold">Módulo de Análise Tática</p>
          <p className="text-xs">Geração de insights complexos baseada nos últimos scrims</p>
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
