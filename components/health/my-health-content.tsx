"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageNav, type PageNavTab } from "@/components/ui/page-nav"
import { useAuth } from "@/lib/auth-context"
import { HealthOnboarding, type HealthProfile } from "./onboarding/health-onboarding"
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
  History,
  ChevronRight,
  ChevronLeft,
  Check,
  User,
  Target,
  Activity,
  Scale,
  Ruler,
  Cake,
  Heart,
  Flame,
  Zap,
  Apple,
  Beef,
  Wheat,
  Loader2,
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
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

// --- TYPES ---
interface NutritionGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
  water: number // liters
}

// --- HELPERS ---
function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100
  return weight / (heightM * heightM)
}

function getBMIClassification(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Abaixo da faixa", color: "text-yellow-500" }
  if (bmi < 25) return { label: "Faixa saudável", color: "text-green-500" }
  if (bmi < 30) return { label: "Acima da faixa", color: "text-yellow-500" }
  return { label: "Muito acima da faixa", color: "text-red-500" }
}

function calculateBMR(weight: number, heightCm: number, age: number, sex: string): number {
  if (sex === "male") return 10 * weight + 6.25 * heightCm - 5 * age + 5
  if (sex === "female") return 10 * weight + 6.25 * heightCm - 5 * age - 161
  return (10 * weight + 6.25 * heightCm - 5 * age - 80)
}

function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }
  return bmr * (multipliers[activityLevel] || 1.55)
}

function calculateNutritionGoals(tdee: number, weight: number, goal: string): NutritionGoals {
  let calories = tdee
  if (goal === "lose") calories = tdee - 400
  else if (goal === "gain") calories = tdee + 300
  const protein = Math.round(weight * 2)
  const fat = Math.round((calories * 0.28) / 9)
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4)
  const water = Math.round((weight * 35) / 1000 * 10) / 10
  return { calories: Math.round(calories), protein, carbs, fat, water }
}

// --- SUB-COMPONENTS ---
function StatCard({ title, value, subtitle, icon: Icon, iconColor, progress, progressMax }: any) {
  return (
    <Card className="stat-card border-border/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`rounded-lg bg-muted/50 p-2.5 ${iconColor}`}><Icon className="h-5 w-5" /></div>
        </div>
        {progress !== undefined && progressMax !== undefined && (
          <div className="mt-3 space-y-1">
            <Progress value={(progress / progressMax) * 100} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MacroProgress({ label, current, target, unit, color, icon: Icon }: any) {
  const percentage = Math.min((current / target) * 100, 100)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">{current} / {target} {unit}</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )
}

function MoodLevelSelector({ label, description, levels = 5, colorClass = "primary", value, onChange }: any) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base">{label}</Label>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: levels }, (_, i) => i + 1).map((n) => (
          <Button
            key={n}
            variant="outline"
            className={`h-12 text-lg font-bold border-2 transition-all ${
              value === n ? "bg-primary border-primary text-white" : "hover:border-primary/50"
            }`}
            onClick={() => onChange(n)}
          >
            {n}
          </Button>
        ))}
      </div>
    </div>
  )
}

function MealTypeSelector({ value, onChange }: any) {
  const types = [
    { id: "breakfast", label: "Café", icon: Apple },
    { id: "lunch", label: "Almoço", icon: Utensils },
    { id: "snack", label: "Lanche", icon: Heart },
    { id: "dinner", label: "Jantar", icon: Moon },
  ]
  return (
    <div className="grid grid-cols-4 gap-2">
      {types.map((type) => {
        const Icon = type.icon
        const isActive = value === type.id
        return (
          <button
            key={type.id}
            onClick={() => onChange(type.id)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1 ${
              isActive ? "border-primary bg-primary/10 text-primary" : "border-border/10 bg-muted/20 hover:border-primary/30"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{type.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// --- MAIN COMPONENT ---
export function MyHealthContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [historyPeriod, setHistoryPeriod] = useState("14")
  const today = new Date().toLocaleDateString("pt-BR")
  
  // Mood form state
  const [moodScore, setMoodScore] = useState<number>(3)
  const [moodEnergy, setMoodEnergy] = useState<number>(3)
  const [moodStress, setMoodStress] = useState<number>(2)
  
  // Sleep form state
  const [sleepQuality, setSleepQuality] = useState<number>(80)
  
  // Food form state
  const [mealType, setMealType] = useState<string>("breakfast")


  const profile = useQuery(api.health.getProfile, user ? { userId: user.id as Id<"users"> } : "skip")
  const record = useQuery(api.health.getRecord, user ? { userId: user.id as Id<"users">, date: today } : "skip")
  const meals = useQuery(api.health.getMeals, user ? { userId: user.id as Id<"users">, date: today } : "skip")
  const appointments = useQuery(api.health.getAppointments, user ? { userId: user.id as Id<"users"> } : "skip")
  const allHistory = useQuery(api.health.getRecordHistory, user ? { userId: user.id as Id<"users">, limit: parseInt(historyPeriod) } : "skip")

  const updateRecord = useMutation(api.health.updateRecord)
  const addMeal = useMutation(api.health.addMeal)

  const goals = useMemo(() => {
    if (!profile) return null
    const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.sex)
    const tdee = calculateTDEE(bmr, profile.activityLevel)
    return calculateNutritionGoals(tdee, profile.weight, profile.goal)
  }, [profile])

  const todayNutrition = useMemo(() => {
    if (!meals) return { calories: 0, protein: 0, carbs: 0, fat: 0 }
    return meals.reduce((acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }, [meals])

  if (profile === undefined) return <div className="flex h-60 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  if (profile === null) {
    return <HealthOnboarding userId={user!.id} onComplete={() => window.location.reload()} />
  }

  const healthTabs: PageNavTab[] = [
    { id: "overview", label: "Visão Geral", icon: Activity },
    { id: "sleep", label: "Sono", icon: Moon },
    { id: "food", label: "Alimentação", icon: Utensils },
    { id: "mood", label: "Mental", icon: Brain },
    { id: "appointments", label: "Consultas", icon: Calendar },
  ]

  return (
    <div className="space-y-6">
      <Card className="relative stat-card border-border/50 overflow-hidden rounded-[2rem]">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent pointer-events-none" />
        <CardContent className="relative p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/20 text-primary invokers-glow-sm">
                <span className="text-2xl font-black">{user?.name?.charAt(0) || "P"}</span>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Olá, {user?.name || "Jogador"}!</h2>
                <p className="text-muted-foreground text-sm font-medium">
                  IMC: <span className="text-foreground font-bold">{calculateBMI(profile.weight, profile.height).toFixed(1)}</span> 
                  <span className={`ml-2 font-bold ${getBMIClassification(calculateBMI(profile.weight, profile.height)).color}`}>
                    ({getBMIClassification(calculateBMI(profile.weight, profile.height)).label})
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
               <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary font-bold">
                 Nível: {profile.activityLevel}
               </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <PageNav tabs={healthTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Sono Última Noite"
              value={record?.sleep ? `${record.sleep.hours}h` : "--"}
              subtitle={`Meta: ${profile.sleepGoal}h`}
              icon={Moon}
              iconColor="text-chart-2"
              progress={record?.sleep?.hours || 0}
              progressMax={profile.sleepGoal}
            />
            <StatCard
              title="Calorias Hoje"
              value={todayNutrition.calories.toLocaleString()}
              subtitle={`Meta: ${goals?.calories.toLocaleString() || "-"} kcal`}
              icon={Flame}
              iconColor="text-chart-3"
              progress={todayNutrition.calories}
              progressMax={goals?.calories || 2000}
            />
            <StatCard
              title="Score de Humor"
              value={record?.mood ? record.mood.score.toString() : "--"}
              subtitle="Score de hoje"
              icon={Brain}
              iconColor="text-chart-4"
            />
            <StatCard
              title="Hidratação"
              value={`${record?.hydration || 0}L`}
              subtitle={`Meta: ${goals?.water || 3}L`}
              icon={Droplets}
              iconColor="text-chart-1"
              progress={record?.hydration || 0}
              progressMax={goals?.water || 3}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 stat-card border-border/50 rounded-[1.5rem]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 font-bold tracking-tight">
                  <Apple className="h-5 w-5 text-chart-3" /> Macronutrientes de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <MacroProgress label="Proteína" current={todayNutrition.protein} target={goals?.protein || 150} unit="g" color="text-chart-1" icon={Beef} />
                <MacroProgress label="Carboidratos" current={todayNutrition.carbs} target={goals?.carbs || 300} unit="g" color="text-chart-2" icon={Wheat} />
                <MacroProgress label="Gorduras" current={todayNutrition.fat} target={goals?.fat || 70} unit="g" color="text-chart-4" icon={Droplets} />
              </CardContent>
            </Card>

            <Card className="stat-card border-border/50 rounded-[1.5rem]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 font-bold tracking-tight">
                  <Calendar className="h-5 w-5 text-primary" /> Consultas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointments?.length ? appointments.slice(0, 3).map((app) => (
                  <div key={app._id} className="p-4 rounded-2xl border border-border/30 bg-muted/10 hover:bg-muted/20 transition-all flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">{app.type}</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-black border-primary/30 text-primary">{app.status}</Badge>
                    </div>
                    <p className="font-bold text-sm tracking-tight">{app.professional}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">{app.date} às {app.time}</p>
                  </div>
                )) : <p className="text-xs text-muted-foreground text-center py-8 font-medium">Nenhuma consulta agendada.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "sleep" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="stat-card border-border/50 lg:col-span-1 rounded-[1.5rem]">
            <CardHeader>
              <CardTitle className="font-bold tracking-tight">Registro de Sono</CardTitle>
              <CardDescription>Otimize seu ciclo circadiano para máxima performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Horas de Sono</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="number" 
                    step="0.5"
                    defaultValue={record?.sleep?.hours || 8}
                    id="sleep-hours"
                    className="h-12 text-lg font-bold bg-muted/20 border-border/40 rounded-xl px-4"
                  />
                  <span className="text-xs font-bold uppercase tracking-widest opacity-40">h</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Qualidade</Label>
                  <span className="text-lg font-black text-primary">{sleepQuality}%</span>
                </div>
                <Input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={sleepQuality} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSleepQuality(parseInt(e.target.value))}
                  className="h-2" 
                />
              </div>
              <Button className="w-full h-12 font-bold rounded-xl" onClick={async () => {
                const hours = parseFloat((document.getElementById('sleep-hours') as HTMLInputElement).value)
                await updateRecord({
                  userId: user!.id as Id<"users">,
                  date: today,
                  sleep: { hours, quality: sleepQuality }
                })
              }}>Registrar Dia</Button>
            </CardContent>
          </Card>

          <Card className="stat-card border-border/50 lg:col-span-2 rounded-[1.5rem]">
            <CardHeader>
              <CardTitle className="font-bold tracking-tight">Histórico Recente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {allHistory?.slice(0, 7).map((rec) => (
                <div key={rec._id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/30 hover:bg-muted/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-chart-2/10 text-chart-2">
                      <Moon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight">{rec.sleep?.hours || 0}h de sono</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">{rec.date} • Qualidade: {rec.sleep?.quality || 0}%</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-20" />
                </div>
              )) || <div className="p-12 text-center opacity-30 flex flex-col items-center gap-2"><Moon className="h-8 w-8" /><span className="text-xs font-black tracking-widest">NENHUM REGISTRO</span></div>}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "food" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="stat-card border-border/50 lg:col-span-1 rounded-[1.5rem]">
            <CardHeader>
              <CardTitle className="font-bold tracking-tight">Novo Log Nutricional</CardTitle>
              <CardDescription>Sincronize sua ingestão com o plano alimentar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Tipo</Label>
                <MealTypeSelector value={mealType} onChange={setMealType} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Refeição</Label>
                <Input placeholder="O que você comeu?" id="meal-name" className="h-12 bg-muted/20 border-border/40 font-bold px-4 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Matriz de Calorias (kcal)</Label>
                <Input type="number" id="meal-cals" className="h-12 bg-muted/20 border-border/40 font-bold px-4 rounded-xl" />
              </div>
              <Button className="w-full h-12 font-bold rounded-xl" onClick={async () => {
                const name = (document.getElementById('meal-name') as HTMLInputElement).value
                const calories = parseInt((document.getElementById('meal-cals') as HTMLInputElement).value)
                if (!name || isNaN(calories)) return
                await addMeal({
                  userId: user!.id as Id<"users">,
                  date: today,
                  time: new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }),
                  type: "Alimentação",
                  name,
                  calories,
                  protein: 0,
                  carbs: 0,
                  fat: 0
                })
                // Clear inputs manually or let it refresh
                ;(document.getElementById('meal-name') as HTMLInputElement).value = ""
                ;(document.getElementById('meal-cals') as HTMLInputElement).value = ""
              }}>Anexar Refeição</Button>
            </CardContent>
          </Card>

          <Card className="stat-card border-border/50 lg:col-span-2 rounded-[1.5rem]">
            <CardHeader>
              <CardTitle className="font-bold tracking-tight">Timeline de Hoje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {meals?.length ? meals.map((meal) => (
                <div key={meal._id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/30 hover:bg-muted/20 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="p-3 rounded-xl bg-chart-3/10 text-chart-3">
                       <Utensils className="h-4 w-4" />
                     </div>
                     <div>
                        <p className="text-sm font-bold tracking-tight">{meal.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">{meal.time} • {meal.calories} kcal</p>
                     </div>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-20" />
                </div>
              )) : <div className="p-12 text-center opacity-30 flex flex-col items-center gap-2"><Plus className="h-8 w-8" /><span className="text-xs font-black tracking-widest">NENHUMA REFEIÇÃO LOGADA</span></div>}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "mood" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="stat-card border-border/50 lg:col-span-1 rounded-[1.5rem]">
            <CardHeader>
              <CardTitle className="font-bold tracking-tight">Registro Mental</CardTitle>
              <CardDescription>O equilíbrio psicológico é a fundação da tomada de decisão</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <MoodLevelSelector
                label="Foco & Reflexo"
                description="Nível de prontidão cognitiva hoje"
                levels={5}
                value={moodScore}
                onChange={(val: number) => setMoodScore(val)}
              />
              <MoodLevelSelector
                label="Energia"
                description="Nível de disposição física"
                levels={5}
                value={moodEnergy}
                onChange={(val: number) => setMoodEnergy(val)}
              />
              <MoodLevelSelector
                label="Estresse"
                description="Nível de tensão (1=baixo, 5=alto)"
                levels={5}
                value={moodStress}
                onChange={(val: number) => setMoodStress(val)}
              />
              <Button className="w-full h-12 font-bold rounded-xl" onClick={async () => {
                await updateRecord({
                  userId: user!.id as Id<"users">,
                  date: today,
                  mood: { 
                    score: moodScore, 
                    energy: moodEnergy, 
                    stress: moodStress 
                  }
                })
              }}>Registrar Dia</Button>
            </CardContent>
          </Card>

          <Card className="stat-card border-border/50 lg:col-span-2 rounded-[1.5rem]">
            <CardHeader>
              <CardTitle className="font-bold tracking-tight">Insight & Histórico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-primary">Insight Adaptativo</h4>
                <p className="text-sm text-primary/80 leading-relaxed font-medium">
                  {record?.mood?.score ? (
                    record.mood.score >= 4 
                    ? "Sua performance cognitiva está em pico. Excelente momento para sessões de macro estratégia ou treinos mecânicos intensos."
                    : "Nível de prontidão estável. Foque em manter a rotina e evite over-thinking durante as partidas de hoje."
                  ) : "Registre seu estado mental para receber recomendações de treino customizadas."}
                </p>
              </div>
              <div className="space-y-3">
                {allHistory?.slice(0, 5).filter(rec => rec.mood).map((rec) => (
                  <div key={rec._id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/30 hover:bg-muted/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-chart-4/10 text-chart-4">
                        <Brain className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">Foco: {rec.mood?.score || 0} • Energia: {rec.mood?.energy || 0}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">{rec.date} • Estresse: {rec.mood?.stress || 0}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-20" />
                  </div>
                )) || <div className="p-12 text-center opacity-30 flex flex-col items-center gap-2"><Brain className="h-8 w-8" /><span className="text-xs font-black tracking-widest">NENHUM REGISTRO</span></div>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "appointments" && (
        <Card className="stat-card border-border/50 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="font-bold tracking-tight">Minhas Consultas</CardTitle>
            <CardDescription>Consultas agendadas para você</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointments?.length ? appointments.map((app) => (
              <div key={app._id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/30 hover:bg-muted/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight">{app.title}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">
                      {app.date} às {app.time} • Agendado por: {app.professional}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] uppercase font-black ${
                    app.status === 'confirmado' ? 'border-green-500/30 text-green-400' :
                    app.status === 'cancelado' ? 'border-red-500/30 text-red-400' :
                    'border-primary/30 text-primary'
                  }`}
                >
                  {app.status}
                </Badge>
              </div>
            )) : (
              <div className="p-12 text-center opacity-30 flex flex-col items-center gap-2">
                <Calendar className="h-8 w-8" />
                <span className="text-xs font-black tracking-widest">NENHUMA CONSULTA AGENDADA</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
