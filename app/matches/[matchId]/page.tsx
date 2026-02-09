"use client"

import React from "react"
import { OfficialMatchDetail } from "@/components/matches/official-match-detail"
import { AppShell } from "@/components/layout/app-shell"

export default function MatchDetailPage({ params }: { params: { matchId: string } }) {
  // Pass default gameVersion and empty gameId (component handles defaults)
  return (
    <AppShell title="Detalhes da Partida" subtitle="Análise detalhada e estatísticas">
      <OfficialMatchDetail 
        matchId={params.matchId} 
        gameId="" 
        gameVersion="14.3.1" 
      />
    </AppShell>
  )
}
