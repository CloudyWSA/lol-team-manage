"use client"

import React, { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MessageSquare, 
  User, 
  Tag, 
  StickyNote,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Share2,
  Plus,
  MapPin,
  Swords,
  Video,
  Brain,
  Timer,
  Check
} from "lucide-react"
import { AgendaEvent, EventType, EventStatus } from "./types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface EventDetailSheetProps {
  event: AgendaEvent | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedEvent: AgendaEvent) => void
  onDelete?: (id: string) => void
  teamUsers?: any[]
}

export function EventDetailSheet({ event, isOpen, onClose, onUpdate, onDelete, teamUsers = [] }: EventDetailSheetProps) {
  const [localEvent, setLocalEvent] = useState<AgendaEvent | null>(event)

  useEffect(() => {
    setLocalEvent(event)
  }, [event])

  if (!localEvent) return null

  const handleUpdate = (updates: Partial<AgendaEvent>) => {
    if (!localEvent) return
    const updated = { ...localEvent, ...updates }
    setLocalEvent(updated)
    onUpdate(updated)
  }

  const typeConfig = {
    Review: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    Treino: "text-red-500 bg-red-500/10 border-red-500/20",
    Estratégia: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    "1-on-1": "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    Media: "text-pink-500 bg-pink-500/10 border-pink-500/20",
    Scrim: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-card/95 backdrop-blur-xl border-l border-border/40 p-0 overflow-hidden flex flex-col h-full">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 z-50" />
        
        <SheetHeader className="p-6 pb-4 pt-10 shrink-0">
          <SheetTitle className="sr-only">Detalhes do Evento: {localEvent.title}</SheetTitle>
          <div className="flex items-center gap-2 mb-4">
            <Select 
              value={localEvent.type} 
              onValueChange={(val) => handleUpdate({ type: val as EventType })}
            >
              <SelectTrigger className={cn(
                "w-fit h-6 text-[10px] font-black uppercase px-2 tracking-widest border",
                typeConfig[localEvent.type as keyof typeof typeConfig]
              )}>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scrim">SCRIM</SelectItem>
                <SelectItem value="Review">REVIEW</SelectItem>
                <SelectItem value="Estratégia">ESTRATÉGIA</SelectItem>
                <SelectItem value="Treino">TREINO</SelectItem>
                <SelectItem value="1-on-1">1-ON-1</SelectItem>
                <SelectItem value="Media">MEDIA</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-[10px] font-mono h-5 opacity-70">
              #{localEvent.id}
            </Badge>
          </div>
          <Input 
            value={localEvent.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            className="text-2xl font-bold tracking-tight leading-tight bg-transparent border-none p-0 focus-visible:ring-0 placeholder:opacity-30 h-auto"
            placeholder="Nome do Evento"
          />
          <SheetDescription className="text-muted-foreground pt-1 flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs">
              <CalendarIcon className="h-3 w-3" />
              Hoje, {localEvent.startTime}
            </span>
          </SheetDescription>
        </SheetHeader>

        <Separator className="bg-border/30 shrink-0" />

        <ScrollArea className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6 space-y-8 pb-10">
            {/* Status & Location */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                  <Tag className="h-3 w-3" /> Status
                </label>
                <Select 
                  value={localEvent.status} 
                  onValueChange={(val) => handleUpdate({ status: val as EventStatus })}
                >
                  <SelectTrigger className="w-full h-8 text-[11px] font-bold uppercase tracking-tight bg-muted/20 border-border/20">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Confirmado">CONFIRMADO</SelectItem>
                    <SelectItem value="Pendente">PENDENTE</SelectItem>
                    <SelectItem value="Cancelado">CANCELADO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> Localização
                </label>
                <Input 
                  value={localEvent.location}
                  onChange={(e) => handleUpdate({ location: e.target.value })}
                  className="h-8 text-[11px] font-bold uppercase tracking-tight bg-muted/20 border-border/20 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            {/* Time Slot */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Horário
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl border border-border/30 bg-muted/20 flex flex-col gap-1">
                  <span className="text-[8px] font-black uppercase opacity-40">Início</span>
                  <Input 
                    type="time"
                    value={localEvent.startTime}
                    onChange={(e) => handleUpdate({ startTime: e.target.value })}
                    className="bg-transparent border-none p-0 focus-visible:ring-0 text-sm h-auto font-bold"
                  />
                </div>
                <div className="p-3 rounded-xl border border-border/30 bg-muted/20 flex flex-col gap-1">
                  <span className="text-[8px] font-black uppercase opacity-40">Fim</span>
                  <Input 
                    type="time"
                    value={localEvent.endTime}
                    onChange={(e) => handleUpdate({ endTime: e.target.value })}
                    className="bg-transparent border-none p-0 focus-visible:ring-0 text-sm h-auto font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                <User className="h-3 w-3" /> Participantes
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {localEvent.assignees.map((name, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="text-[10px] font-bold h-6 gap-2 pr-1 cursor-pointer hover:bg-destructive/20 transition-colors"
                    onClick={() => {
                      const updated = localEvent.assignees.filter((_, index) => index !== i)
                      handleUpdate({ assignees: updated })
                    }}
                  >
                    {name.charAt(0).toUpperCase()}
                    <span className="opacity-70">{name}</span>
                    <Trash2 className="h-2 w-2 opacity-30" />
                  </Badge>
                ))}
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-full border-dashed">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0 bg-card border-border/40" align="start">
                    <Command className="bg-transparent">
                      <CommandInput placeholder="Buscar usuário..." className="h-8 text-xs" />
                      <CommandList>
                        <CommandEmpty className="text-[10px] py-3 tracking-widest uppercase opacity-40">Nenhum usuário encontrado.</CommandEmpty>
                        <CommandGroup>
                          {teamUsers?.map((user) => (
                            <CommandItem
                              key={user._id}
                              value={user.name}
                              onSelect={() => {
                                if (!localEvent.assignees.includes(user.name)) {
                                  handleUpdate({ assignees: [...localEvent.assignees, user.name] })
                                }
                              }}
                              className="text-[11px] font-bold gap-2 cursor-pointer"
                            >
                              <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px]">
                                {user.name.charAt(0)}
                              </div>
                              {user.name}
                              {localEvent.assignees.includes(user.name) && (
                                <Check className="ml-auto h-3 w-3 text-primary" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3" /> Objetivos da Sessão
              </label>
              <Textarea 
                value={localEvent.description}
                onChange={(e) => handleUpdate({ description: e.target.value })}
                placeholder="Qual o foco principal desta atividade?"
                className="text-[13px] leading-relaxed text-muted-foreground bg-muted/5 p-4 rounded-xl border border-border/10 italic min-h-[80px] focus-visible:ring-primary/20"
              />
            </div>

            {/* Observations */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                <StickyNote className="h-3 w-3" /> Observações Táticas
              </label>
              <div className="relative group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/40 rounded-l-xl" />
                <Textarea 
                  value={localEvent.observations}
                  onChange={(e) => handleUpdate({ observations: e.target.value })}
                  placeholder="Notas adicionais para a equipe..."
                  className="text-[13px] text-foreground/80 bg-muted/10 p-4 pl-6 rounded-xl border border-border/20 focus-visible:ring-blue-500/20 min-h-[80px]"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 bg-card border-t border-border/30 flex gap-2 shrink-0">
          <Button 
            className="flex-1 gap-2 font-bold tracking-tight shadow-md"
            onClick={onClose}
          >
            <CheckCircle2 className="h-4 w-4" /> SALVAR ALTERAÇÕES
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 text-destructive hover:bg-destructive/10"
            onClick={() => localEvent.id && onDelete?.(localEvent.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
