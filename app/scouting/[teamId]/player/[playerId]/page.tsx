import { AppShell } from "@/components/layout/app-shell"
import { PlayerSoloQDetail } from "@/components/scouting/player-soloq-detail"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ teamId: string; playerId: string }>
}) {
  const { playerId } = await params
  return {
    title: `SoloQ Detail - ${playerId} | Invokers`,
    description: `Analise de SoloQ do jogador`,
  }
}

export default async function PlayerSoloQPage({
  params,
}: {
  params: Promise<{ teamId: string; playerId: string }>
}) {
  const { teamId, playerId } = await params

  return (
    <AppShell
      title="Detalhes do Jogador"
      subtitle="Análise SoloQ Riot API"
    >
      <PlayerSoloQDetail teamId={teamId} playerId={playerId} />
    </AppShell>
  )
}
