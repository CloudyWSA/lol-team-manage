import { AppShell } from "@/components/layout/app-shell"
import { TeamContent } from "@/components/team/team-content"

export default function TeamPage() {
  return (
    <AppShell
      title="Equipe"
      subtitle="Membros da organizacao Invokers"
    >
      <TeamContent />
    </AppShell>
  )
}
