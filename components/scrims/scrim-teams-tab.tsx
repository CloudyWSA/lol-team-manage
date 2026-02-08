"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const mockTeams = [
  { name: "Loud Academy", region: "BR", winRate: "65%", lastMet: "02/02", tier: "S" },
  { name: "Pain Gaming", region: "BR", winRate: "45%", lastMet: "30/01", tier: "S" },
  { name: "Red Canids", region: "BR", winRate: "80%", lastMet: "15/01", tier: "A" },
]

export function ScrimTeamsTab() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {mockTeams.map((team) => (
        <Card key={team.name} className="stat-card border-border/50 hover:border-primary/30 transition-all">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar className="h-12 w-12 border-2 border-border/50">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {team.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{team.name}</CardTitle>
                <Badge variant="outline" className="text-primary border-primary/20">{team.tier}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{team.region} • WR: {team.winRate}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-muted-foreground">Último encontro:</span>
              <span className="font-medium">{team.lastMet}</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-1 mt-3">
              <div className="bg-primary h-1 rounded-full w-[65%]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
