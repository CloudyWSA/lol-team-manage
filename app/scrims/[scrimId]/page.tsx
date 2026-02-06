import { AppShell } from "@/components/layout/app-shell"
import { ScrimDetail } from "@/components/scrims/scrim-detail"
import { getLatestVersion } from "@/lib/riot-assets"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ scrimId: string }>
}) {
  const { scrimId } = await params
  return {
    title: `Scrim ${scrimId} | Invokers`,
    description: `Detalhes e analise do scrim ${scrimId}`,
  }
}

export default async function ScrimDetailPage({
  params,
}: {
  params: Promise<{ scrimId: string }>
}) {
  const { scrimId } = await params
  const version = await getLatestVersion()

  return (
    <AppShell
      title="Detalhes do Scrim"
      subtitle="Analise de performance e planejamento estrategico"
    >
      <ScrimDetail scrimId={scrimId} gameVersion={version} />
    </AppShell>
  )
}
