"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Moon,
  Utensils,
  Brain,
  Calendar,
  Clock,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Droplets,
  Activity,
  Heart,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"

// Mock data for charts
const sleepData = [
  { day: "Seg", hours: 7, quality: 80 },
  { day: "Ter", hours: 6.5, quality: 70 },
  { day: "Qua", hours: 8, quality: 90 },
  { day: "Qui", hours: 7.5, quality: 85 },
  { day: "Sex", hours: 6, quality: 60 },
  { day: "Sab", hours: 9, quality: 95 },
  { day: "Dom", hours: 8, quality: 88 },
]

const moodData = [
  { day: "Seg", score: 4, energy: 3 },
  { day: "Ter", score: 3, energy: 2 },
  { day: "Qua", score: 5, energy: 4 },
  { day: "Qui", score: 4, energy: 4 },
  { day: "Sex", score: 3, energy: 2 },
  { day: "Sab", score: 5, energy: 5 },
  { day: "Dom", score: 4, energy: 4 },
]

const appointments = [
  {
    id: 1,
    type: "Psicologia",
    professional: "Dra. Ana Silva",
    date: "05/02/2026",
    time: "14:00",
    status: "confirmado",
  },
  {
    id: 2,
    type: "Fisioterapia",
    professional: "Dr. Carlos Mendes",
    date: "07/02/2026",
    time: "10:00",
    status: "agendado",
  },
  {
    id: 3,
    type: "Nutricionista",
    professional: "Dra. Julia Costa",
    date: "10/02/2026",
    time: "11:00",
    status: "agendado",
  },
]

const todayMeals = [
  { id: 1, type: "Cafe da manha", time: "08:00", description: "Ovos, pao integral, suco", calories: 450 },
  { id: 2, type: "Almoco", time: "12:30", description: "Frango, arroz, salada", calories: 650 },
  { id: 3, type: "Lanche", time: "16:00", description: "Frutas, iogurte", calories: 200 },
]

export function HealthContent() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Visao Geral</TabsTrigger>
          <TabsTrigger value="sleep">Sono</TabsTrigger>
          <TabsTrigger value="food">Alimentacao</TabsTrigger>
          <TabsTrigger value="mood">Humor & Mental</TabsTrigger>
          <TabsTrigger value="appointments">Consultas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Media de Sono"
              value="7.4h"
              subtitle="Ultimos 7 dias"
              trend={8}
              icon={Moon}
              iconColor="text-chart-2"
            />
            <StatCard
              title="Calorias Diarias"
              value="2,150"
              subtitle="Meta: 2,400 kcal"
              trend={-5}
              icon={Utensils}
              iconColor="text-chart-3"
            />
            <StatCard
              title="Score de Humor"
              value="4.0"
              subtitle="Media semanal"
              trend={12}
              icon={Brain}
              iconColor="text-chart-4"
            />
            <StatCard
              title="Hidratacao"
              value="2.5L"
              subtitle="Meta: 3L"
              trend={0}
              icon={Droplets}
              iconColor="text-chart-1"
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sleep Chart */}
            <Card className="stat-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Moon className="h-5 w-5 text-chart-2" />
                  Padrao de Sono
                </CardTitle>
                <CardDescription>Horas dormidas nos ultimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sleepData}>
                      <defs>
                        <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.55 0.18 300)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.55 0.18 300)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.04 285)" />
                      <XAxis 
                        dataKey="day" 
                        stroke="oklch(0.65 0.02 285)" 
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="oklch(0.65 0.02 285)" 
                        fontSize={12}
                        tickLine={false}
                        domain={[0, 10]}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "oklch(0.18 0.03 285)",
                          border: "1px solid oklch(0.28 0.04 285)",
                          borderRadius: "0.5rem",
                        }}
                        labelStyle={{ color: "oklch(0.95 0.01 285)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="hours"
                        stroke="oklch(0.55 0.18 300)"
                        strokeWidth={2}
                        fill="url(#sleepGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Mood Chart */}
            <Card className="stat-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-chart-4" />
                  Humor & Energia
                </CardTitle>
                <CardDescription>Evolucao do bem-estar mental</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.04 285)" />
                      <XAxis 
                        dataKey="day" 
                        stroke="oklch(0.65 0.02 285)" 
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="oklch(0.65 0.02 285)" 
                        fontSize={12}
                        tickLine={false}
                        domain={[0, 5]}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "oklch(0.18 0.03 285)",
                          border: "1px solid oklch(0.28 0.04 285)",
                          borderRadius: "0.5rem",
                        }}
                        labelStyle={{ color: "oklch(0.95 0.01 285)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Humor"
                        stroke="oklch(0.6 0.16 320)"
                        strokeWidth={2}
                        dot={{ fill: "oklch(0.6 0.16 320)", strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="energy"
                        name="Energia"
                        stroke="oklch(0.7 0.15 270)"
                        strokeWidth={2}
                        dot={{ fill: "oklch(0.7 0.15 270)", strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments Preview */}
          <Card className="stat-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Proximas Consultas</CardTitle>
                <CardDescription>Agendamentos confirmados</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("appointments")}>
                Ver todas
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {appointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className="rounded-lg border border-border/50 bg-muted/30 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="secondary" className="mb-2">
                          {apt.type}
                        </Badge>
                        <p className="font-medium">{apt.professional}</p>
                      </div>
                      <Badge
                        variant={apt.status === "confirmado" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {apt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {apt.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sleep Tab */}
        <TabsContent value="sleep" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Sleep Log Form */}
            <Card className="stat-card border-border/50 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Registrar Sono</CardTitle>
                <CardDescription>Adicione os dados da noite passada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Horario de dormir</Label>
                  <Input type="time" defaultValue="23:00" className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Horario de acordar</Label>
                  <Input type="time" defaultValue="07:00" className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Qualidade do sono (1-10)</Label>
                  <Select defaultValue="8">
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n} - {n <= 3 ? "Ruim" : n <= 6 ? "Regular" : n <= 8 ? "Bom" : "Excelente"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Observacoes</Label>
                  <Textarea 
                    placeholder="Acordou durante a noite? Teve dificuldade para dormir?"
                    className="bg-muted/50 resize-none"
                    rows={3}
                  />
                </div>
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar
                </Button>
              </CardContent>
            </Card>

            {/* Sleep Stats */}
            <div className="space-y-6 lg:col-span-2">
              <Card className="stat-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Estatisticas de Sono</CardTitle>
                  <CardDescription>Analise dos ultimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Media de horas</p>
                      <p className="text-3xl font-bold">7.4h</p>
                      <Progress value={74} className="h-2" />
                      <p className="text-xs text-muted-foreground">Meta: 8h</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Qualidade media</p>
                      <p className="text-3xl font-bold">81%</p>
                      <Progress value={81} className="h-2" />
                      <p className="text-xs text-muted-foreground">Acima da media</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Consistencia</p>
                      <p className="text-3xl font-bold">85%</p>
                      <Progress value={85} className="h-2" />
                      <p className="text-xs text-muted-foreground">Horarios regulares</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Historico Semanal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sleepData}>
                        <defs>
                          <linearGradient id="sleepGradient2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(0.55 0.18 300)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="oklch(0.55 0.18 300)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.04 285)" />
                        <XAxis 
                          dataKey="day" 
                          stroke="oklch(0.65 0.02 285)" 
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="oklch(0.65 0.02 285)" 
                          fontSize={12}
                          tickLine={false}
                          domain={[0, 10]}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "oklch(0.18 0.03 285)",
                            border: "1px solid oklch(0.28 0.04 285)",
                            borderRadius: "0.5rem",
                          }}
                          labelStyle={{ color: "oklch(0.95 0.01 285)" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="hours"
                          name="Horas"
                          stroke="oklch(0.55 0.18 300)"
                          strokeWidth={2}
                          fill="url(#sleepGradient2)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Food Tab */}
        <TabsContent value="food" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Meal Log Form */}
            <Card className="stat-card border-border/50 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Registrar Refeicao</CardTitle>
                <CardDescription>Adicione o que voce comeu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de refeicao</Label>
                  <Select defaultValue="almoco">
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cafe">Cafe da manha</SelectItem>
                      <SelectItem value="almoco">Almoco</SelectItem>
                      <SelectItem value="lanche">Lanche</SelectItem>
                      <SelectItem value="jantar">Jantar</SelectItem>
                      <SelectItem value="ceia">Ceia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Horario</Label>
                  <Input type="time" defaultValue="12:30" className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>O que voce comeu?</Label>
                  <Textarea 
                    placeholder="Descreva sua refeicao..."
                    className="bg-muted/50 resize-none"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Calorias estimadas</Label>
                  <Input type="number" placeholder="500" className="bg-muted/50" />
                </div>
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar
                </Button>
              </CardContent>
            </Card>

            {/* Today's Meals */}
            <div className="space-y-6 lg:col-span-2">
              <Card className="stat-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Refeicoes de Hoje</CardTitle>
                  <CardDescription>Acompanhamento nutricional diario</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-muted/30 p-4">
                      <p className="text-sm text-muted-foreground">Calorias consumidas</p>
                      <p className="text-2xl font-bold">1,300</p>
                      <Progress value={54} className="mt-2 h-2" />
                      <p className="mt-1 text-xs text-muted-foreground">de 2,400 kcal</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-4">
                      <p className="text-sm text-muted-foreground">Refeicoes</p>
                      <p className="text-2xl font-bold">3 / 5</p>
                      <Progress value={60} className="mt-2 h-2" />
                      <p className="mt-1 text-xs text-muted-foreground">Meta diaria</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-4">
                      <p className="text-sm text-muted-foreground">Agua</p>
                      <p className="text-2xl font-bold">2.0L</p>
                      <Progress value={67} className="mt-2 h-2" />
                      <p className="mt-1 text-xs text-muted-foreground">de 3L</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {todayMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                            <Utensils className="h-5 w-5 text-chart-3" />
                          </div>
                          <div>
                            <p className="font-medium">{meal.type}</p>
                            <p className="text-sm text-muted-foreground">{meal.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{meal.calories} kcal</p>
                          <p className="text-sm text-muted-foreground">{meal.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Mood Tab */}
        <TabsContent value="mood" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Mood Log Form */}
            <Card className="stat-card border-border/50 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Como voce esta?</CardTitle>
                <CardDescription>Registre seu estado emocional</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Humor geral (1-5)</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Button
                        key={n}
                        variant={n === 4 ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nivel de energia (1-5)</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Button
                        key={n}
                        variant={n === 3 ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nivel de estresse (1-5)</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Button
                        key={n}
                        variant={n === 2 ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notas</Label>
                  <Textarea 
                    placeholder="Como foi seu dia? Algo te preocupa?"
                    className="bg-muted/50 resize-none"
                    rows={3}
                  />
                </div>
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar
                </Button>
              </CardContent>
            </Card>

            {/* Mood History */}
            <div className="space-y-6 lg:col-span-2">
              <Card className="stat-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Evolucao do Humor</CardTitle>
                  <CardDescription>Ultimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={moodData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.04 285)" />
                        <XAxis 
                          dataKey="day" 
                          stroke="oklch(0.65 0.02 285)" 
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="oklch(0.65 0.02 285)" 
                          fontSize={12}
                          tickLine={false}
                          domain={[0, 5]}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "oklch(0.18 0.03 285)",
                            border: "1px solid oklch(0.28 0.04 285)",
                            borderRadius: "0.5rem",
                          }}
                          labelStyle={{ color: "oklch(0.95 0.01 285)" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          name="Humor"
                          stroke="oklch(0.6 0.16 320)"
                          strokeWidth={2}
                          dot={{ fill: "oklch(0.6 0.16 320)", strokeWidth: 0, r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="energy"
                          name="Energia"
                          stroke="oklch(0.7 0.15 270)"
                          strokeWidth={2}
                          dot={{ fill: "oklch(0.7 0.15 270)", strokeWidth: 0, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Insights</CardTitle>
                  <CardDescription>Padroes identificados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 rounded-lg border border-border/50 bg-muted/30 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Humor melhor apos dormir bem</p>
                        <p className="text-sm text-muted-foreground">
                          Nos dias com mais de 7h de sono, seu humor foi em media 20% melhor.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-lg border border-border/50 bg-muted/30 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
                        <Activity className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-medium">Energia menor nas sextas</p>
                        <p className="text-sm text-muted-foreground">
                          Seu nivel de energia tende a cair nas sextas. Considere ajustar a rotina.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Schedule New */}
            <Card className="stat-card border-border/50 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Agendar Consulta</CardTitle>
                <CardDescription>Solicite um novo horario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de consulta</Label>
                  <Select defaultValue="psicologia">
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="psicologia">Psicologia</SelectItem>
                      <SelectItem value="fisioterapia">Fisioterapia</SelectItem>
                      <SelectItem value="nutricionista">Nutricionista</SelectItem>
                      <SelectItem value="medico">Medico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data preferida</Label>
                  <Input type="date" className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Horario preferido</Label>
                  <Select defaultValue="manha">
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manha">Manha (8h-12h)</SelectItem>
                      <SelectItem value="tarde">Tarde (14h-18h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Observacoes</Label>
                  <Textarea 
                    placeholder="Algo especifico para discutir?"
                    className="bg-muted/50 resize-none"
                    rows={3}
                  />
                </div>
                <Button className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Solicitar
                </Button>
              </CardContent>
            </Card>

            {/* Appointments List */}
            <div className="space-y-6 lg:col-span-2">
              <Card className="stat-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Proximas Consultas</CardTitle>
                  <CardDescription>Seus agendamentos confirmados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
                            <Heart className="h-6 w-6 text-chart-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{apt.type}</p>
                              <Badge
                                variant={apt.status === "confirmado" ? "default" : "outline"}
                                className="text-xs"
                              >
                                {apt.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{apt.professional}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{apt.date}</p>
                          <p className="text-sm text-muted-foreground">{apt.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  trend: number
  icon: React.ElementType
  iconColor: string
}

function StatCard({ title, value, subtitle, trend, icon: Icon, iconColor }: StatCardProps) {
  return (
    <Card className="stat-card border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center gap-2">
              {trend !== 0 && (
                <span
                  className={`flex items-center text-xs ${
                    trend > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {trend > 0 ? (
                    <TrendingUp className="mr-0.5 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-0.5 h-3 w-3" />
                  )}
                  {Math.abs(trend)}%
                </span>
              )}
              {trend === 0 && (
                <span className="flex items-center text-xs text-muted-foreground">
                  <Minus className="mr-0.5 h-3 w-3" />
                  0%
                </span>
              )}
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            </div>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
