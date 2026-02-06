import { AppShell } from "@/components/layout/app-shell"
import { ScoutingContent } from "@/components/scouting/scouting-content"

export const metadata = {
  title: "Scouting | Invokers",
  description: "Analise de times adversarios",
}

export default function ScoutingPage() {
  return (
    <AppShell title="Scouting" subtitle="Analise de times e jogadores adversarios">
      <ScoutingContent />
    </AppShell>
  )
}
