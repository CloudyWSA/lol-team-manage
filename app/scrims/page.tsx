import { AppShell } from "@/components/layout/app-shell"
import { ScrimsContent } from "@/components/scrims/scrims-content"

export const metadata = {
  title: "Scrims | Invokers",
  description: "Gerenciamento de scrims e treinos",
}

export default function ScrimsPage() {
  return (
    <AppShell title="Scrims" subtitle="Treinos e partidas de pratica">
      <ScrimsContent />
    </AppShell>
  )
}
