"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Moon,
  TrendingUp,
  TrendingDown,
  Minus,
  Droplets,
  ChevronRight,
  ChevronLeft,
  Check,
  User,
  Target,
  Activity,
  Scale,
  Ruler,
  Cake,
  Flame,
  Beef,
  Wheat,
} from "lucide-react"

// Types
export interface HealthProfile {
  height: number // cm
  weight: number // kg
  age: number
  sex: "male" | "female" | "not_informed"
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active"
  sleepGoal: number // hours
  goal: "lose" | "maintain" | "gain"
  completed: boolean
}

interface NutritionGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
  water: number // liters
}

// Helper functions (copied from main file for self-containment/organization)
function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100
  return weight / (heightM * heightM)
}

function getBMIClassification(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Abaixo da faixa", color: "text-yellow-500" }
  if (bmi < 25) return { label: "Faixa saudavel", color: "text-green-500" }
  if (bmi < 30) return { label: "Acima da faixa", color: "text-yellow-500" }
  return { label: "Muito acima da faixa", color: "text-red-500" }
}

function calculateBMR(weight: number, heightCm: number, age: number, sex: string): number {
  if (sex === "male") return 10 * weight + 6.25 * heightCm - 5 * age + 5
  if (sex === "female") return 10 * weight + 6.25 * heightCm - 5 * age - 161
  const maleBMR = 10 * weight + 6.25 * heightCm - 5 * age + 5
  const femaleBMR = 10 * weight + 6.25 * heightCm - 5 * age - 161
  return (maleBMR + femaleBMR) / 2
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

import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

export function HealthOnboarding({
  userId,
  onComplete,
}: {
  userId: string
  onComplete: (profile: HealthProfile) => void
}) {
  const [step, setStep] = useState(1)
  const totalSteps = 4
  const updateProfile = useMutation(api.health.updateProfile)
  const [profile, setProfile] = useState<Partial<HealthProfile>>({
    height: 175,
    weight: 70,
    age: 22,
    sex: "male",
    activityLevel: "moderate",
    sleepGoal: 8,
    goal: "maintain",
  })

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      const finalProfile = {
        ...profile,
        completed: true,
      } as HealthProfile
      
      await updateProfile({
        userId: userId as Id<"users">,
        weight: finalProfile.weight,
        height: finalProfile.height,
        age: finalProfile.age,
        sex: finalProfile.sex,
        activityLevel: finalProfile.activityLevel,
        goal: finalProfile.goal,
        sleepGoal: finalProfile.sleepGoal,
      })
      
      onComplete(finalProfile)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const progressPercent = (step / totalSteps) * 100

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-primary/10 invokers-glow-sm">
          <Target className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Personalize seu Desempenho</h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Sincronize sua biometria para otimizar seus pilares de saúde e foco competitivo.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative pt-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary/60">Etapa {step} / {totalSteps}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-primary/60">{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-1.5 bg-primary/10" />
      </div>

      {/* Step Content */}
      <Card className="border-border/40 bg-card/30 backdrop-blur-xl shadow-2xl overflow-hidden rounded-[2rem]">
        <CardContent className="p-8 md:p-12">
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 border-b border-border/20 pb-6">
                <div className="p-3 rounded-2xl bg-chart-1/10 text-chart-1">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Identidade Biológica</h2>
                  <p className="text-muted-foreground">Base para o seu metabolismo basal</p>
                </div>
              </div>

              <div className="grid gap-10 md:grid-cols-2">
                <div className="space-y-4">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Idade Atual</Label>
                  <div className="relative items-center">
                    <Cake className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                    <Input
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                      className="h-14 pl-12 text-xl font-medium bg-muted/20 border-border/40 focus:border-primary/50 transition-all rounded-2xl shadow-inner"
                      min={14}
                      max={60}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Gênero</Label>
                  <RadioGroup
                    value={profile.sex}
                    onValueChange={(value: string) => setProfile({ ...profile, sex: value as HealthProfile["sex"] })}
                    className="grid grid-cols-1 gap-3"
                  >
                    {[
                      { value: "male", label: "Masculino" },
                      { value: "female", label: "Feminino" },
                      { value: "not_informed", label: "Não informar" },
                    ].map((s) => (
                      <Label
                        key={s.value}
                        className={`flex cursor-pointer items-center justify-center h-14 rounded-2xl border-2 transition-all font-bold ${
                          profile.sex === s.value
                            ? "border-primary bg-primary/10 text-primary shadow-lg ring-1 ring-primary/20"
                            : "border-border/20 bg-muted/10 hover:border-primary/30"
                        }`}
                      >
                        <RadioGroupItem value={s.value} className="sr-only" />
                        {s.label}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 border-b border-border/20 pb-6">
                <div className="p-3 rounded-2xl bg-chart-2/10 text-chart-2">
                  <Scale className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Métricas Corporais</h2>
                  <p className="text-muted-foreground">Precisão no cálculo de composição</p>
                </div>
              </div>

              <div className="grid gap-10 sm:grid-cols-2">
                <div className="space-y-4">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Altura (cm)</Label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                    <Input
                      type="number"
                      value={profile.height}
                      onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) || 0 })}
                      className="h-14 pl-12 text-xl font-medium bg-muted/20 border-border/40 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Peso (kg)</Label>
                  <div className="relative">
                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                    <Input
                      type="number"
                      value={profile.weight}
                      onChange={(e) => setProfile({ ...profile, weight: parseInt(e.target.value) || 0 })}
                      className="h-14 pl-12 text-xl font-medium bg-muted/20 border-border/40 rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              {profile.height && profile.weight && (
                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 backdrop-blur-md flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase opacity-60">Seu IMC Atual</span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-black text-primary">
                        {calculateBMI(profile.weight, profile.height).toFixed(1)}
                      </span>
                      <span className={`text-sm font-bold ${getBMIClassification(calculateBMI(profile.weight, profile.height)).color}`}>
                        • {getBMIClassification(calculateBMI(profile.weight, profile.height)).label}
                      </span>
                    </div>
                  </div>
                  <Activity className="h-10 w-10 text-primary opacity-20" />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 border-b border-border/20 pb-6">
                <div className="p-3 rounded-2xl bg-chart-3/10 text-chart-3">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Nível de Atividade</h2>
                  <p className="text-muted-foreground">Dinamismo da sua rotina diária</p>
                </div>
              </div>

              <RadioGroup
                value={profile.activityLevel}
                onValueChange={(value: string) => setProfile({ ...profile, activityLevel: value as HealthProfile["activityLevel"] })}
                className="grid gap-4"
              >
                {[
                  { value: "sedentary", label: "Sedentário", desc: "Minimalista em movimento" },
                  { value: "light", label: "Leve", desc: "1-3 dias de treino" },
                  { value: "moderate", label: "Moderado", desc: "3-5 dias consistentes" },
                  { value: "active", label: "Ativo", desc: "6-7 dias intensos" },
                ].map((opt) => (
                  <Label
                    key={opt.value}
                    className={`flex items-center gap-6 p-6 cursor-pointer border-2 rounded-3xl transition-all ${
                      profile.activityLevel === opt.value
                        ? "border-primary bg-primary/5 shadow-inner"
                        : "border-border/10 hover:border-primary/20 bg-muted/5"
                    }`}
                  >
                    <RadioGroupItem value={opt.value} className="h-6 w-6" />
                    <div className="flex-1">
                      <div className="text-lg font-bold">{opt.label}</div>
                      <div className="text-sm text-muted-foreground">{opt.desc}</div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 border-b border-border/20 pb-6">
                <div className="p-3 rounded-2xl bg-chart-4/10 text-chart-4">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Objetivos de Foco</h2>
                  <p className="text-muted-foreground">Sua meta principal de bem-estar</p>
                </div>
              </div>

              <div className="space-y-10">
                <RadioGroup
                  value={profile.goal}
                  onValueChange={(value: string) => setProfile({ ...profile, goal: value as HealthProfile["goal"] })}
                  className="grid grid-cols-3 gap-4"
                >
                  {[
                    { value: "lose", label: "Reduzir", icon: TrendingDown },
                    { value: "maintain", label: "Estabilizar", icon: Minus },
                    { value: "gain", label: "Evoluir", icon: TrendingUp },
                  ].map((opt) => {
                    const Icon = opt.icon
                    return (
                      <Label
                        key={opt.value}
                        className={`flex flex-col items-center justify-center p-6 gap-3 cursor-pointer border-2 rounded-3xl transition-all ${
                          profile.goal === opt.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border/10 hover:border-primary/20"
                        }`}
                      >
                        <RadioGroupItem value={opt.value} className="sr-only" />
                        <Icon className="h-8 w-8" />
                        <span className="text-sm font-black uppercase tracking-tighter">{opt.label}</span>
                      </Label>
                    )
                  })}
                </RadioGroup>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Meta de Repouso (Horas)</Label>
                  <Select
                    value={profile.sleepGoal?.toString()}
                    onValueChange={(val) => setProfile({ ...profile, sleepGoal: parseInt(val) })}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-border/40 font-bold text-lg px-6">
                      <SelectValue placeholder="Selecione as horas" />
                    </SelectTrigger>
                    <SelectContent>
                      {[7, 8, 9].map((h) => (
                        <SelectItem key={h} value={h.toString()} className="font-medium">
                          {h} Horas {h === 8 && "(Padrão Pro)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Goals Summary Preview */}
                {profile.height && profile.weight && profile.age && profile.sex && profile.activityLevel && profile.goal && (
                  <div className="relative p-8 rounded-[2rem] bg-foreground text-background shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Target className="h-24 w-24 rotate-12" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] mb-8 opacity-60">Matriz de Nutrição Prevista</p>
                    
                    {(() => {
                      const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.sex!)
                      const tdee = calculateTDEE(bmr, profile.activityLevel!)
                      const goals = calculateNutritionGoals(tdee, profile.weight, profile.goal!)
                      return (
                        <div className="grid grid-cols-2 gap-y-8 gap-x-4 sm:grid-cols-4">
                          <div className="space-y-1">
                            <Flame className="h-5 w-5 text-primary mb-1" />
                            <div className="text-2xl font-black">{goals.calories}</div>
                            <div className="text-[10px] font-bold uppercase opacity-50">Kcal/dia</div>
                          </div>
                          <div className="space-y-1">
                            <Beef className="h-5 w-5 text-chart-1 mb-1" />
                            <div className="text-2xl font-black">{goals.protein}g</div>
                            <div className="text-[10px] font-bold uppercase opacity-50">Proteína</div>
                          </div>
                          <div className="space-y-1">
                            <Wheat className="h-5 w-5 text-chart-2 mb-1" />
                            <div className="text-2xl font-black">{goals.carbs}g</div>
                            <div className="text-[10px] font-bold uppercase opacity-50">Carbs</div>
                          </div>
                          <div className="space-y-1">
                            <Droplets className="h-5 w-5 text-chart-4 mb-1" />
                            <div className="text-2xl font-black">{goals.water}L</div>
                            <div className="text-[10px] font-bold uppercase opacity-50">Hidratação</div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex gap-4 pt-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={step === 1}
          className="h-14 px-8 font-bold border-2 border-transparent hover:border-border/40 rounded-2xl"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Voltar
        </Button>
        <Button 
          onClick={handleNext} 
          className="h-14 flex-1 text-lg font-black uppercase tracking-widest rounded-2xl invokers-glow shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {step === totalSteps ? (
            <>
              Ativar Perfil
              <Check className="ml-2 h-6 w-6" />
            </>
          ) : (
            <>
              Próximo
              <ChevronRight className="ml-2 h-6 w-6" />
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 max-w-sm mx-auto">
        Dados processados via matriz de Mifflin-St Jeor. Consultas físicas profissionais são indispensáveis.
      </p>
    </div>
  )
}
