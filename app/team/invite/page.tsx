import { AppShell } from "@/components/layout/app-shell"
import { InviteContent } from "@/components/team/invite-content"

export default function InvitePage() {
  return (
    <AppShell
      title="Convidar Membro"
      subtitle="Adicionar novo membro a equipe"
      requireStaff={true}
    >
      <InviteContent />
    </AppShell>
  )
}
