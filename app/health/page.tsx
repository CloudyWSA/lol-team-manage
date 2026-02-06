import { AppShell } from "@/components/layout/app-shell"
import { TeamHealthContent } from "@/components/health/team-health-content"

export const metadata = {
  title: "Saude da Equipe | Invokers",
  description: "Acompanhamento de saude e bem-estar de todos os jogadores",
}

export default function HealthPage() {
  return (
    <AppShell 
      title="Saude da Equipe" 
      subtitle="Acompanhamento de saude e bem-estar de todos os jogadores"
      requireStaff={true}
    >
      <TeamHealthContent />
    </AppShell>
  )
}
