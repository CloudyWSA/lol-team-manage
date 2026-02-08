"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Target, Zap, Shield, Swords } from "lucide-react"

export function ScrimAnalysisTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="stat-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Impacto Early Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">+12.5%</div>
            <p className="text-xs text-muted-foreground mt-1">Eficiência em ganks aos 10m</p>
          </CardContent>
        </Card>
        <Card className="stat-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              Controle de Objetivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">78%</div>
            <p className="text-xs text-muted-foreground mt-1">Taxa de primeiro dragão</p>
          </CardContent>
        </Card>
        <Card className="stat-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Swords className="h-4 w-4 text-red-500" />
              Teamfight Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">8.4</div>
            <p className="text-xs text-muted-foreground mt-1">Escala de 1-10 baseada em DPM</p>
          </CardContent>
        </Card>
      </div>

      <Card className="stat-card border-border/50">
        <CardHeader>
          <CardTitle>Tendências Recentes</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-xl opacity-50">
          <TrendingUp className="h-10 w-10 mb-2 mr-2" />
          <p>Gráfico de evolução de performance em processamento...</p>
        </CardContent>
      </Card>
    </div>
  )
}
