import { AppShell } from "@/components/layout/app-shell"
import { TeamScoutingDetail } from "@/components/scouting/team-scouting-detail"

// Mock team data - in production this would come from a database
const teamsData: Record<string, { name: string; region: string }> = {
  loud: { name: "LOUD", region: "BR" },
  pain: { name: "paiN Gaming", region: "BR" },
  furia: { name: "FURIA", region: "BR" },
  red: { name: "RED Canids", region: "BR" },
  intz: { name: "INTZ", region: "BR" },
}

export async function generateMetadata({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  const team = teamsData[teamId]
  return {
    title: `${team?.name || "Time"} - Scouting | Invokers`,
    description: `Analise detalhada do time ${team?.name}`,
  }
}

export default async function TeamScoutingPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  const team = teamsData[teamId]

  return (
    <AppShell
      title={team?.name || "Time"}
      subtitle={`Scouting - ${team?.region || "Regiao"}`}
    >
      <TeamScoutingDetail teamId={teamId} />
    </AppShell>
  )
}
