import { AppShell } from "@/components/layout/app-shell"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export const metadata = {
  title: "Dashboard | Invokers",
  description: "Painel principal do jogador Invokers",
}

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" subtitle="Visao geral do seu dia">
      <DashboardContent />
    </AppShell>
  )
}
