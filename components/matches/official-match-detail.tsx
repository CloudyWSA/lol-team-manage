"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageNav, type PageNavTab } from "@/components/ui/page-nav"
import {
  Eye,
  BarChart3,
  Video as VideoIcon,
  ChevronLeft,
  Calendar,
  Clock,
  Youtube,
  ExternalLink,
  User,
  Loader2,
} from "lucide-react"
import { 
  MatchTeamRoster,
} from "@/components/matches/match-detail-shared"
import { MatchAnalyticalTabs } from "@/components/matches/match-analytical-tabs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

const officialMatchTabs: PageNavTab[] = [
  { id: "overview", label: "Visão Geral", icon: Eye },
  { id: "analytical", label: "Análise Avançada", icon: BarChart3 },
  { id: "media", label: "Broadcast & POVs", icon: VideoIcon },
]

export function OfficialMatchDetail({ matchId, gameId, gameVersion }: { matchId: string, gameId: string, gameVersion: string }) {
  const [activeTab, setActiveTab] = useState("overview")
  
  // Convex Query
  const match = useQuery(api.matches.getMatchWithGames, { matchId: matchId as Id<"officialMatches"> })

  if (!match) return <div className="flex h-60 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  // Find the specific game if gameId is provided, or default to first
  const currentGame = match.games.find(g => g._id === gameId) || match.games[0] || {
    _id: "none",
    gameNumber: 1,
    duration: "00:00",
    win: false,
    kills: 0,
    deaths: 0,
    assists: 0,
  }

  const displayData = {
    opponent: match.opponent,
    tournament: match.tournament,
    date: match.date,
    duration: currentGame.duration,
    won: currentGame.win,
    teams: {
      blue: {
        name: "Invokers",
        won: currentGame.win,
        players: [
          { name: "ThunderStrike", role: "Top", champion: "Jax" },
          { name: "ShadowJungle", role: "Jungle", champion: "LeeSin" },
          { name: "ArcaneWizard", role: "Mid", champion: "Orianna" },
          { name: "PhantomADC", role: "ADC", champion: "Ezreal" },
          { name: "GuardianSupp", role: "Support", champion: "Leona" },
        ]
      },
      red: {
        name: match.opponent,
        won: !currentGame.win,
        players: []
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/matches">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Game {currentGame.gameNumber} vs. {displayData.opponent}</h1>
              <Badge className={displayData.won ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}>
                {displayData.won ? "Vitória" : "Derrota"}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-4 text-muted-foreground">
               <span className="flex items-center gap-1.5 text-sm uppercase font-black tracking-widest text-primary">
                {displayData.tournament}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-4 w-4" />
                {displayData.date}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <Clock className="h-4 w-4" />
                {displayData.duration}
              </span>
            </div>
          </div>
        </div>
      </div>

      <PageNav tabs={officialMatchTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <MatchTeamRoster team={displayData.teams.blue} isBlue={true} version={gameVersion} />
            <MatchTeamRoster team={displayData.teams.red} isBlue={false} version={gameVersion} />
          </div>
        )}

        {activeTab === "analytical" && <MatchAnalyticalTabs />}

        {activeTab === "media" && (
          <div className="grid lg:grid-cols-2 gap-6">
              <Card className="stat-card border-border/50 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-500" />
                    Transmissão Oficial
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-video bg-black flex items-center justify-center">
                    <Button variant="outline">Abrir VOD</Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="stat-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Câmeras dos Jogadores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {displayData.teams.blue.players.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <p className="font-bold">{p.name}</p>
                        <Badge variant="outline" className="text-[10px]">{p.role}</Badge>
                      </div>
                      <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
          </div>
        )}
      </div>
    </div>
  )
}
