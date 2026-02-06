"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Loader2, Users, Shield, Gamepad2, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

import { Suspense } from "react"

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteCode = searchParams.get("invite")
  const { login, register } = useAuth()
  
  // Tabs state
  const [activeTab, setActiveTab] = useState("login")

  // Login states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Registration states
  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regRole, setRegRole] = useState<"coach" | "player" | "analyst">("player")
  const [regTeam, setRegTeam] = useState("")
  const [regPosition, setRegPosition] = useState("")

  // Invitation data
  const invitation = useQuery(api.invitations.getByCode, inviteCode ? { code: inviteCode } : "skip")

  useEffect(() => {
    if (inviteCode && invitation) {
      setActiveTab("register")
      setRegRole(invitation.role)
      setRegTeam(invitation.teamName || "")
      if (invitation.position) setRegPosition(invitation.position)
      if (invitation.email) setRegEmail(invitation.email)
    }
  }, [inviteCode, invitation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const success = await login(email, password)
    
    if (success) {
      router.push("/dashboard")
    } else {
      setError("Credenciais invalidas. Verifique seu email.")
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!regName || !regEmail || (!regTeam && !inviteCode)) {
      setError("Por favor, preencha todos os campos obrigatórios.")
      setIsLoading(false)
      return
    }

    const success = await register({
      name: regName,
      email: regEmail,
      role: regRole,
      teamName: inviteCode ? undefined : regTeam,
      inviteCode: inviteCode || undefined,
      position: regPosition || undefined
    })

    if (success) {
      router.push("/dashboard")
    } else {
      setError("Erro ao realizar cadastro. Convite pode estar expirado ou email em uso.")
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <img src="/logo.png" alt="Invokers Logo" className="h-20 w-auto invokers-logo-glow" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Invokers</h1>
            <p className="mt-1 text-sm text-muted-foreground">Team Management Platform</p>
          </div>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Acesso ao Sistema</CardTitle>
              <CardDescription>
                {inviteCode ? "Concluindo seu convite para a equipe" : "Entre ou crie uma conta para gerenciar seu time"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inviteCode && !invitation && invitation !== null && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validando seu convite...
                </div>
              )}

              {inviteCode && invitation === null && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Convite inválido ou expirado.
                </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Cadastrar</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-muted/50"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-muted/50"
                        disabled={isLoading}
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full invokers-glow-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Autenticando...
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="regName">Nome</Label>
                        <Input
                          id="regName"
                          placeholder="Player One"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="bg-muted/50"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="regEmail">Email</Label>
                        <Input
                          id="regEmail"
                          type="email"
                          placeholder="pro@team.gg"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="bg-muted/50"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="regTeam">Nome do Time</Label>
                      <Input
                        id="regTeam"
                        placeholder="Invokers Academy"
                        value={regTeam}
                        onChange={(e) => setRegTeam(e.target.value)}
                        className="bg-muted/50"
                        disabled={isLoading || !!inviteCode}
                      />
                      {inviteCode && invitation && (
                        <p className="text-xs text-primary">Convite para: {invitation.teamName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cargo</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={regRole}
                          onChange={(e) => setRegRole(e.target.value as any)}
                          disabled={isLoading || !!inviteCode}
                        >
                          <option value="player">Jogador</option>
                          <option value="coach">Coach</option>
                          <option value="analyst">Analista</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="regPos">Posição (opcional)</Label>
                        <Input
                          id="regPos"
                          placeholder="Mid Lane"
                          value={regPosition}
                          onChange={(e) => setRegPosition(e.target.value)}
                          className="bg-muted/50"
                          disabled={isLoading || (!!inviteCode && !!invitation?.position)}
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full invokers-glow-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        inviteCode ? "Aceitar Convite e Começar" : "Registrar e Começar"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Invokers Esports &copy; 2026. Sistema de Gestão de Alto Desempenho.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
