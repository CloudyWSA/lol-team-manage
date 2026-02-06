"use client"

import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  MapPin, 
  MoreVertical,
  Swords,
  Video,
  Brain,
  Timer,
  GripVertical
} from "lucide-react"
import { AgendaEvent } from "./types"
import { cn } from "@/lib/utils"

interface AgendaEventCardProps {
  event: AgendaEvent
  onClick?: (event: AgendaEvent) => void
}

const typeIcons = {
  Review: Video,
  Treino: Swords,
  Estratégia: Brain,
  "1-on-1": Timer,
  Media: Video,
  Scrim: Swords,
}

const typeColors = {
  Review: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  Treino: "text-red-500 bg-red-500/10 border-red-500/20",
  Estratégia: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  "1-on-1": "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  Media: "text-pink-500 bg-pink-500/10 border-pink-500/20",
  Scrim: "text-orange-500 bg-orange-500/10 border-orange-500/20",
}

export function AgendaEventCard({ event, onClick }: AgendaEventCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: event.id,
    data: {
      type: "Event",
      event,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const Icon = typeIcons[event.type as keyof typeof typeIcons] || Video

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 border-2 border-primary/50 border-dashed rounded-2xl h-[90px] mb-4 bg-primary/5 w-full"
      />
    )
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-white/5 before:rounded-full group/event"
    >
      <Card 
        className={cn(
          "border-white/5 hover:border-primary/40 transition-all bg-black/60 backdrop-blur-xl cursor-pointer relative overflow-hidden group shadow-2xl shadow-black/50 rounded-2xl",
          "active:scale-[0.99] active:rotate-[0.5deg]"
        )}
        onClick={() => onClick?.(event)}
      >
        <div className="flex h-full">
          <div className={cn("w-2 shrink-0 opacity-80", typeColors[event.type as keyof typeof typeColors]?.split(" ")[0])} />
          <CardContent className="p-4 flex-1 flex items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner",
                typeColors[event.type as keyof typeof typeColors]
              )}>
                <Icon className="h-6 w-6" />
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] leading-none font-mono">
                    {event.type}
                  </span>
                  <Badge variant="outline" className={cn(
                    "text-[9px] font-black h-[18px] px-2 leading-none border-none font-mono tracking-tighter",
                    event.status === 'Pendente' ? 'bg-amber-500/20 text-amber-400' : 
                    event.status === 'Cancelado' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  )}>
                    {event.status.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="text-[14px] font-bold tracking-tight group-hover:text-primary transition-colors text-white/90 uppercase">
                  {event.title}
                </h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono font-black">
                    <Clock className="h-3 w-3 text-primary/60" /> {event.startTime} - {event.endTime}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono font-black">
                    <MapPin className="h-3 w-3 text-primary/60" /> {event.location.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div 
                {...attributes} 
                {...listeners}
                className="p-2 hover:bg-white/10 rounded-lg transition-all cursor-grab active:cursor-grabbing opacity-20 group-hover/event:opacity-100"
              >
                <GripVertical className="h-5 w-5 text-white/50" />
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-white/30 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-full">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}
