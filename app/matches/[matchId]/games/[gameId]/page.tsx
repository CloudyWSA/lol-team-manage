import { AppShell } from "@/components/layout/app-shell"
import { OfficialMatchDetail } from "@/components/matches/official-match-detail"
import { getLatestVersion } from "@/lib/riot-assets"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ matchId: string, gameId: string }>
}) {
  const { matchId, gameId } = await params
  return {
    title: `Partida ${matchId} - G${gameId} | Invokers`,
    description: `Analise detalhada da partida oficial`,
  }
}

export default async function OfficialMatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string, gameId: string }>
}) {
  const { matchId, gameId } = await params
  const version = await getLatestVersion()

  return (
    <AppShell
      title="Analise de Partida Oficial"
      subtitle="Dados avançados e performance em torneio"
    >
      <OfficialMatchDetail matchId={matchId} gameId={gameId} gameVersion={version} />
    </AppShell>
  )
}
