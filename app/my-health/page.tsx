import { AppShell } from "@/components/layout/app-shell"
import { MyHealthContent } from "@/components/health/my-health-content"

export const metadata = {
  title: "Minha Saude | Invokers",
  description: "Acompanhe sua saude e bem-estar pessoal",
}

export default function MyHealthPage() {
  return (
    <AppShell 
      title="Minha Saude" 
      subtitle="Acompanhe seu bem-estar e mantenha seus registros em dia"
    >
      <MyHealthContent />
    </AppShell>
  )
}
