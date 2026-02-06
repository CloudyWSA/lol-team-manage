"use client"

import React from "react"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { AgendaEventCard } from "./agenda-event-card"
import { AgendaEvent } from "./types"

interface AgendaTimelineProps {
  events: AgendaEvent[]
  onEventClick?: (event: AgendaEvent) => void
}

export function AgendaTimeline({ events, onEventClick }: AgendaTimelineProps) {
  const eventIds = events.map((e) => e.id)

  return (
    <div className="space-y-4 relative">
      {/* Dynamic Time Grid Background */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-border/10 rounded-full" />
      
      <SortableContext items={eventIds} strategy={verticalListSortingStrategy}>
        {events.map((event) => (
          <AgendaEventCard 
            key={event.id} 
            event={event} 
            onClick={onEventClick} 
          />
        ))}
      </SortableContext>

      {events.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-border/20 rounded-2xl bg-muted/5 group hover:bg-muted/10 transition-colors">
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-40">
            Nenhum evento agendado para hoje
          </p>
        </div>
      )}
    </div>
  )
}
