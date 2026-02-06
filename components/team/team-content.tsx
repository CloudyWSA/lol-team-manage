"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"
import { 
  Shield, 
  Gamepad2, 
  BarChart3, 
  Crown,
  MoreVertical,
  UserPlus,
  Trash2,
  Loader2
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

const getRoleIcon = (role: string) => {
  switch (role) {
    case "coach":
      return <Crown className="h-4 w-4" />
    case "analyst":
      return <BarChart3 className="h-4 w-4" />
    case "player":
      return <Gamepad2 className="h-4 w-4" />
    default:
      return <Shield className="h-4 w-4" />
  }
}

export function TeamContent() {
  const { user, isStaff } = useAuth()
  const members = useQuery(api.users.listByTeam, user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip")
  const removeMember = useMutation(api.users.remove)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  
  const handleRemoveMember = async (id: Id<"users">) => {
    try {
      await removeMember({ id })
      toast.success("Membro removido com sucesso.")
    } catch (error) {
      toast.error("Erro ao remover membro.")
    }
  }

  if (!members) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  const staff = members.filter(m => m.role === "coach" || m.role === "analyst")
  
  // Sort players by traditional position order
  const positionOrder = ["Top", "Jungle", "Mid", "ADC", "Support"]
  const players = members
    .filter(m => m.role === "player")
    .sort((a, b) => {
      const orderA = positionOrder.indexOf(a.position || "")
      const orderB = positionOrder.indexOf(b.position || "")
      return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB)
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        {isStaff && (
          <div className="flex gap-3">
            <Button 
              asChild
              className="gap-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-black uppercase text-xs tracking-widest px-6"
            >
              <Link href="/team/invite">
                <UserPlus className="h-4 w-4" />
                Gerenciar Convites
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Squad Sections */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Staff Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="h-5 w-1 bg-primary rounded-full" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Coaching Staff</h3>
          </div>
          <div className="flex flex-col gap-2">
            {staff.length === 0 ? (
              <p className="text-xs text-muted-foreground italic px-3 py-4 border border-dashed rounded-lg">Nenhuma staff registrada</p>
            ) : staff.map((member) => (
              <div
                key={member._id}
                className="group relative flex items-center justify-between rounded-lg border border-border/40 bg-muted/5 hover:bg-muted/10 p-3 transition-colors overflow-hidden"
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className="relative">
                    <Avatar className="h-11 w-11 border-2 border-border/50 group-hover:border-primary/30 transition-colors">
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500 shadow-sm" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold tracking-tight">{member.name}</p>
                      <Badge variant="outline" className={`text-[9px] h-4 px-1 leading-none uppercase font-black border-transparent bg-primary/10 text-primary`}>
                        {member.role === 'coach' ? 'COORDENADOR' : 'ANALISTA'}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground opacity-70 italic">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 z-10">
                  <div className="hidden sm:flex flex-col items-end">
                    <p className="text-[9px] font-black uppercase text-muted-foreground/50 leading-none mb-1">Status</p>
                    <p className="text-[10px] font-mono font-bold capitalize">{member.isOnline ? "Online" : "Offline"}</p>
                  </div>
                  {isStaff && member._id !== user?._id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-border/50 bg-background/95 backdrop-blur-xl">
                        <DropdownMenuItem 
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/5 font-black uppercase text-[10px] tracking-widest"
                          onClick={() => handleRemoveMember(member._id)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Revogar Acesso
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Players Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="h-5 w-1 bg-accent rounded-full" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Jogadores</h3>
          </div>
          <div className="flex flex-col gap-2">
            {players.length === 0 ? (
              <p className="text-xs text-muted-foreground italic px-3 py-4 border border-dashed rounded-lg">Nenhum jogador registrado</p>
            ) : players.map((member) => (
              <div
                key={member._id}
                className="group relative flex items-center justify-between rounded-lg border border-border/40 bg-muted/5 hover:bg-muted/10 p-3 transition-colors overflow-hidden"
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className="relative">
                    <Avatar className="h-11 w-11 border-2 border-border/50 group-hover:border-accent/30 transition-colors">
                      <AvatarFallback className="bg-accent/5 text-accent text-xs font-black">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500 shadow-sm" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold tracking-tight">{member.name}</p>
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5 leading-none uppercase font-black border-accent/20 text-accent">
                        {member.position}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground opacity-70 italic">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 z-10">
                  <div className="hidden sm:flex flex-col items-end">
                    <p className="text-[9px] font-black uppercase text-muted-foreground/50 leading-none mb-1">Status</p>
                    <p className="text-[10px] font-mono font-bold capitalize">{member.isOnline ? "Online" : "Offline"}</p>
                  </div>
                  {isStaff && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/10 hover:text-accent transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-border/50 bg-background/95 backdrop-blur-xl">
                        <DropdownMenuItem 
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/5 font-black uppercase text-[10px] tracking-widest"
                          onClick={() => handleRemoveMember(member._id)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Dispensar Atleta
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
