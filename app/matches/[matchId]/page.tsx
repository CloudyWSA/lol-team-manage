

import React from "react"
import { OfficialMatchDetail } from "@/components/matches/official-match-detail"
import { AppShell } from "@/components/layout/app-shell"

import { getLatestVersion } from "@/lib/riot-assets"

export default async function MatchDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params
  const version = await getLatestVersion()

  return (
    <AppShell title="Detalhes da Partida" subtitle="Análise detalhada e estatísticas">
      <OfficialMatchDetail 
        matchId={matchId} 
        gameId="" 
        gameVersion={version} 
      />
    </AppShell>
  )
}
