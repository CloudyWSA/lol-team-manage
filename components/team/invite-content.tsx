"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft, 
  Mail, 
  Copy, 
  Check, 
  Link as LinkIcon,
  Shield,
  Gamepad2,
  BarChart3,
  Clock,
  X,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"

export function InviteContent() {
  const { user } = useAuth()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"coach" | "player" | "analyst" | "">("")
  const [position, setPosition] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const createInvite = useMutation(api.invitations.create)
  const cancelInvite = useMutation(api.invitations.cancel)
  const pendingInvites = useQuery(api.invitations.listByTeam, user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip")

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/login?invite=${code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success("Link copiado para a área de transferência!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendInvite = async () => {
    if (!user?.teamId || !role) return

    setIsGenerating(true)
    try {
      await createInvite({
        teamId: user.teamId as Id<"teams">,
        role: role as any,
        email: email || undefined,
        position: position || undefined,
      })
      toast.success("Convite gerado com sucesso!")
      setEmail("")
      setRole("")
      setPosition("")
    } catch (error) {
      toast.error("Erro ao gerar convite.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCancelInvite = async (id: Id<"invitations">) => {
    try {
      await cancelInvite({ id })
      toast.success("Convite cancelado.")
    } catch (error) {
      toast.error("Erro ao cancelar convite.")
    }
  }

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case "coach":
        return <Shield className="h-4 w-4" />
      case "analyst":
        return <BarChart3 className="h-4 w-4" />
      case "player":
        return <Gamepad2 className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/team">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Equipe
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Invite by Email */}
        <Card className="stat-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-primary" />
              Convidar Membro
            </CardTitle>
            <CardDescription>
              Gere um link de convite para adicionar novos membros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="novomembro@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Função</Label>
              <Select value={role} onValueChange={(val) => setRole(val as any)}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="h-4 w-4" />
                      Jogador
                    </div>
                  </SelectItem>
                  <SelectItem value="analyst">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Analista
                    </div>
                  </SelectItem>
                  <SelectItem value="coach">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Coach
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === "player" && (
              <div className="space-y-2">
                <Label>Posição</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Selecione a posição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Top">Top</SelectItem>
                    <SelectItem value="Jungle">Jungle</SelectItem>
                    <SelectItem value="Mid">Mid</SelectItem>
                    <SelectItem value="ADC">ADC</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleSendInvite}
              disabled={!role || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Gerar Link de Convite
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Invite Info */}
        <Card className="stat-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-accent" />
              Segurança e Acesso
            </CardTitle>
            <CardDescription>
              Como funciona o processo de convite
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <p className="text-sm font-medium mb-2">Processo:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Gere um link para a função desejada</li>
                <li>Copie e envie o link para o novo membro</li>
                <li>O membro cria a conta e entra automaticamente no seu time</li>
                <li>O link expira em 7 dias após a criação</li>
              </ol>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Nota: Membros que entrarem pelo seu convite terão acesso imediato aos dados do time, incluindo agenda e táticas.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invites */}
      <Card className="stat-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-yellow-500" />
            Links Gerados
          </CardTitle>
          <CardDescription>
            Convites ativos aguardando cadastro
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingInvites ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : pendingInvites.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum link ativo disponível
            </p>
          ) : (
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div
                  key={invite._id}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                      {getRoleIcon(invite.role)}
                    </div>
                    <div>
                      <p className="font-medium">{invite.email || "Qualquer pessoa com o link"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {invite.role === "player" && invite.position
                            ? invite.position
                            : invite.role.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          CODE: {invite.code}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleCopyLink(invite.code)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar Link
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => handleCancelInvite(invite._id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
