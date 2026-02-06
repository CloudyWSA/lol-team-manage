import { AppShell } from "@/components/layout/app-shell"
import { MatchesContent } from "@/components/matches/matches-content"

export const metadata = {
  title: "Partidas Oficiais | Invokers",
  description: "Historico de partidas oficiais",
}

export default function MatchesPage() {
  return (
    <AppShell title="Partidas Oficiais" subtitle="Campeonatos e competicoes">
      <MatchesContent />
    </AppShell>
  )
}
