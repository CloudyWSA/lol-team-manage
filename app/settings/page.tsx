"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { User, Settings, Shield, Bell, Globe, Palette, Camera, Save, Loader2, CheckCircle2, Plus, LayoutGrid } from "lucide-react"
import { toast } from "sonner"
import { AppShell } from "@/components/layout/app-shell"

export default function SettingsPage() {
  const { user, isStaff } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  
  // Real-time user data
  const userData = useQuery(api.users.getById, user ? { id: user.id as Id<"users"> } : "skip")
  const teamData = useQuery(api.teams.getTeam, user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip")
  
  const updateProfile = useMutation(api.users.updateProfile)
  const updateTeam = useMutation(api.teams.updateTeam)

  const [isLoading, setIsLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Profile State
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("")
  const [position, setPosition] = useState("")

  // Team State
  const [teamName, setTeamName] = useState("")
  const [teamLogo, setTeamLogo] = useState("")

  // File Upload
  const generateUploadUrl = useMutation(api.users.generateUploadUrl)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // 1. Get upload URL
      const postUrl = await generateUploadUrl()
      
      // 2. Post file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })
      
      if (!result.ok) throw new Error("Upload failed")
      
      const { storageId } = await result.json()
      
      // 3. Update avatar state with storageId (will be saved on "Salvar Alterações" or immediately?)
      // For immediate preview, we can use a local URL or just set the storageId and let handleSaveProfile save it?
      // The user expects the "Save" button to persist everything, but usually avatar upload is immediate or previewed.
      // Let's set it to state and let them click Save.
      // BUT current backend logic resolves storageId to URL on fetch. 
      // If we save storageId now, we won't see preview until we refetch with resolution.
      // Proper way: Store storageId in state, but show local preview.
      
      setAvatar(storageId) // Store ID. 
      
      // Warning: The existing img tag expects a URL. If we set storageId string, it might break preview until saved/refetched.
      // Let's rely on saving. Or better: create a local preview.
      
      // Actually, let's just trigger save immediately for avatar?
      // Or better, let's just use local preview for now?
      // Complex because `avatar` state is used for both input text and img src.
      
      // Let's separate preview? 
      // Simplified: Just setAvatar(storageId). The img src will break temporarily if we don't handle it.
      // Wait, if it's not a URL, img src breaks.
      // Let's update `avatar` BUT we need a way to preview.
      
      // Hack: Since we can't easily resolve storageId on client without query, 
      // let's auto-save profile with new storageID, then invalidate query?
      // Or just accept that it breaks preview until reload?
      // Better: Use `URL.createObjectURL(file)` so user sees it right away.
      // But we need to distinguish between "unsaved URL" and "saved avatar".
      
      // For now, let's keep it simple: Just put storageId. 
      // If it breaks, user clicks "Save" and page reloads/updates.
      // Actually, let's auto-save to ensure it works.
      
      await updateProfile({
        id: user!.id as Id<"users">,
        avatar: storageId,
      })
      toast.success("Foto atualizada!")
      
    } catch (error) {
      console.error(error)
      toast.error("Erro ao fazer upload")
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    if (userData) {
      setName(userData.name)
      setAvatar(userData.avatar || "")
      setPosition(userData.position || "")
    }
  }, [userData])

  useEffect(() => {
    if (teamData) {
      setTeamName(teamData.name)
      setTeamLogo(teamData.logo || "")
    }
  }, [teamData])

  const handleSaveProfile = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      await updateProfile({
        id: user.id as Id<"users">,
        name,
        avatar,
        position,
      })
      toast.success("Perfil atualizado com sucesso!")
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      toast.error("Erro ao atualizar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTeam = async () => {
    if (!user?.teamId) return
    setIsLoading(true)
    try {
      await updateTeam({
        teamId: user.teamId as Id<"teams">,
        name: teamName,
        logo: teamLogo,
      })
      toast.success("Dados do time atualizados!")
    } catch (error) {
      toast.error("Erro ao atualizar time")
    } finally {
      setIsLoading(false)
    }
  }

  if (!userData) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <AppShell title="Centro de Comando" subtitle="Gerencie seu perfil de elite e os dados da sua organização">
      <div className="max-w-5xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row gap-10">
          {/* Settings Sidebar */}
          <aside className="w-full md:w-64 flex flex-col gap-2">
            <div className="mb-6 px-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Navegação</h2>
            </div>
            
            <TabsList className="flex flex-col h-auto bg-transparent border-none p-0 gap-2">
              <TabsTrigger 
                value="profile" 
                className="w-full justify-start h-14 px-6 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-black text-white/60 font-bold uppercase tracking-widest text-[10px] transition-all hover:bg-white/5 gap-4"
              >
                <User className="h-4 w-4" /> Perfil de Elite
              </TabsTrigger>
              <TabsTrigger 
                value="team" 
                className="w-full justify-start h-14 px-6 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-black text-white/60 font-bold uppercase tracking-widest text-[10px] transition-all hover:bg-white/5 gap-4"
                disabled={!isStaff}
              >
                <Shield className="h-4 w-4" /> Organização
              </TabsTrigger>
            </TabsList>

            <div className="mt-auto pt-10 px-4">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-primary opacity-80 animate-pulse">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Sincronizado</span>
                </div>
              )}
            </div>
          </aside>

          {/* Settings Content */}
          <div className="flex-1 min-w-0">

        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-border/50 bg-muted/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Informações Pessoais
                </CardTitle>
                <CardDescription>Atualize seu nome de exibição e cargo no time</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest opacity-60">Nome Completo</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 bg-background border-border/40 font-bold px-4 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-xs font-black uppercase tracking-widest opacity-60">Cargo (Sistema)</Label>
                    <Input id="role" value={userData.role} disabled className="h-12 bg-muted/20 border-border/40 font-bold px-4 rounded-xl opacity-50" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-xs font-black uppercase tracking-widest opacity-60">
                      {isStaff ? "Status Profissional" : "Posição / Role (In-game)"}
                    </Label>
                    {isStaff ? (
                      <div className="h-14 flex items-center px-6 bg-primary/10 border border-primary/20 rounded-2xl">
                        <Badge className="bg-primary text-black font-black uppercase tracking-tighter px-3">Staff / Especialista</Badge>
                      </div>
                    ) : (
                      <Select value={position} onValueChange={setPosition}>
                        <SelectTrigger className="h-14 bg-background border-border/40 font-bold px-6 rounded-2xl focus:ring-primary/20">
                          <SelectValue placeholder="Selecione sua posição" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/10 text-white font-mono">
                          <SelectItem value="Top" className="focus:bg-white/10">Topo (Top)</SelectItem>
                          <SelectItem value="Jungle" className="focus:bg-white/10">Selva (Jungle)</SelectItem>
                          <SelectItem value="Mid" className="focus:bg-white/10">Meio (Mid)</SelectItem>
                          <SelectItem value="ADC" className="focus:bg-white/10">Atirador (ADC)</SelectItem>
                          <SelectItem value="Support" className="focus:bg-white/10">Suporte (Support)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full h-14 text-lg font-black uppercase tracking-widest invokers-glow rounded-2xl"
                    disabled={isLoading}
                    onClick={handleSaveProfile}
                  >
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-muted/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Camera className="h-5 w-5 text-chart-4" /> Foto de Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 flex flex-col items-center gap-6">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="h-32 w-32 rounded-[2rem] bg-primary/20 flex items-center justify-center text-4xl font-black text-primary overflow-hidden border-2 border-primary/20">
                    {avatar ? <img src={avatar} alt="Avatar" className="h-full w-full object-cover" /> : name.charAt(0)}
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[2rem]">
                    {isUploading ? <Loader2 className="animate-spin text-white h-8 w-8" /> : <Plus className="text-white h-8 w-8" />}
                  </div>
                </div>
                <div className="w-full space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-60">URL da Imagem</Label>
                  <Input 
                    placeholder="https://sua-imagem.com/foto.jpg" 
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="h-11 bg-background border-border/40 text-xs rounded-lg"
                  />
                  <p className="text-[10px] text-muted-foreground text-center">Clique na foto para fazer upload ou cole uma URL</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        <TabsContent value="team" className="space-y-6">
          <Card className="border-border/50 bg-muted/5 rounded-[2rem]">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Dados da Organização
              </CardTitle>
              <CardDescription>Atualize os dados públicos da sua equipe (Apenas Staff)</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="teamName" className="text-xs font-black uppercase tracking-widest opacity-60">Nome da Equipe</Label>
                    <Input 
                      id="teamName" 
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="h-14 text-xl font-black bg-background border-primary/20 rounded-2xl px-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest opacity-60">Logo da Equipe (URL)</Label>
                    <Input 
                      value={teamLogo}
                      onChange={(e) => setTeamLogo(e.target.value)}
                      placeholder="https://link-para-o-logo.png" 
                      className="h-12 bg-background border-border/40 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10">
                  <div className="h-40 w-40 rounded-[2rem] bg-muted/20 flex items-center justify-center border-2 border-dashed border-primary/20 mb-4 overflow-hidden">
                    {teamLogo ? <img src={teamLogo} alt="Team Logo" className="h-full w-full object-contain p-4" /> : <Shield className="h-16 w-16 opacity-20" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Preview do Logo</span>
                </div>
              </div>
              <Button 
                className="w-full h-14 text-lg font-black uppercase tracking-widest invokers-glow rounded-2xl"
                onClick={handleSaveTeam}
                disabled={isLoading}
              >
                Atualizar Organização
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  </div>
</AppShell>
  )
}
