"use client"

import React, { useState, useMemo } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  List,
  Clock,
  MapPin,
  Loader2
} from "lucide-react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { createPortal } from "react-dom"
import { AgendaTimeline } from "@/components/staff/agenda/agenda-timeline"
import { AgendaEventCard } from "@/components/staff/agenda/agenda-event-card"
import { EventDetailSheet } from "@/components/staff/agenda/event-detail-sheet"
import { AgendaEvent } from "@/components/staff/agenda/types"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

export default function StaffAgendaPage() {
  const { user } = useAuth()
  const [selectedDay, setSelectedDay] = useState(4)
  const [viewMode, setViewMode] = useState<"day" | "week">("day")
  const [activeEvent, setActiveEvent] = useState<AgendaEvent | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Convex Queries & Mutations
  const rawEvents = useQuery(api.agenda.listAllForTeam, user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip")
  const rawAppointments = useQuery((api as any).appointments.listAppointments, user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip")
  const createEventMutation = useMutation(api.agenda.createEvent)
  const updateEventMutation = useMutation(api.agenda.updateEvent)
  const deleteEventMutation = useMutation(api.agenda.deleteEvent)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  // Helper to calculate end time (start + 1h)
  const calculateEndTime = (startTime: string) => {
    const [h, m] = startTime.split(":").map(Number)
    const endH = (h + 1) % 24
    return `${endH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
  }

  // Map Convex objects to AgendaEvent type
  const allEventsFlattened = useMemo(() => {
    const events: AgendaEvent[] = []
    
    if (rawEvents) {
      rawEvents.forEach(e => {
        events.push({
          id: e._id,
          title: e.title,
          description: e.description,
          startTime: e.startTime,
          endTime: e.endTime,
          type: e.type,
          status: e.status,
          location: e.location,
          assignees: e.assignees,
          observations: e.observations,
          priority: e.priority as any,
          date: e.date,
        })
      })
    }

    if (rawAppointments) {
      (rawAppointments as any[]).forEach(a => {
        events.push({
          id: a._id,
          title: a.title,
          description: a.description,
          startTime: a.time,
          endTime: calculateEndTime(a.time),
          type: a.type, // e.g., "Psicólogo"
          status: a.status.charAt(0).toUpperCase() + a.status.slice(1), // Capitalize
          location: "Consultório/Online",
          assignees: [a.professional],
          observations: a.observations,
          priority: "Media",
          date: a.date,
        })
      })
    }

    return events.sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [rawEvents, rawAppointments])

  // Group events by day (for display dots)
  const groupedEvents = useMemo(() => {
    const groups: Record<number, AgendaEvent[]> = {}
    allEventsFlattened.forEach((e: AgendaEvent) => {
      // Extract day from date string "2026-02-04"
      const day = parseInt(e.date?.split("-")[2] || "0")
      if (day > 0) {
        if (!groups[day]) groups[day] = []
        groups[day].push(e)
      }
    })
    return groups
  }, [allEventsFlattened])

  const events = useMemo(() => groupedEvents[selectedDay] || [], [groupedEvents, selectedDay])
  
  const selectedEvent = useMemo(() => {
    return allEventsFlattened.find((e: AgendaEvent) => e.id === selectedEventId) || null
  }, [allEventsFlattened, selectedEventId])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const draggedEvent = events.find((e: AgendaEvent) => e.id === active.id)
    if (draggedEvent) setActiveEvent(draggedEvent)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveEvent(null)
  }

  const handleEventClick = (event: AgendaEvent) => {
    setSelectedEventId(event.id)
    setIsSheetOpen(true)
  }

  const handleUpdateEvent = async (updatedEvent: AgendaEvent) => {
    await updateEventMutation({
      id: updatedEvent.id as Id<"agendaEvents">,
      title: updatedEvent.title,
      status: updatedEvent.status as "Confirmado" | "Pendente" | "Cancelado",
    })
  }

  const handleDeleteEvent = async (id: string) => {
    await deleteEventMutation({ id: id as Id<"agendaEvents"> })
    setIsSheetOpen(false)
  }

  const addNewEvent = async () => {
    if (!user) return
    
    // Construct date string for selectedDay (Fev 2026)
    const dateStr = `2026-02-${selectedDay.toString().padStart(2, "0")}`
    
    const newId = await createEventMutation({
      title: "Novo Evento",
      startTime: "12:00",
      endTime: "13:00",
      type: "Review",
      status: "Pendente",
      location: "Gaming House",
      assignees: [],
      priority: "Media",
      teamId: user.teamId as Id<"teams">,
      date: dateStr,
    })
    
    setSelectedEventId(newId)
    setIsSheetOpen(true)
  }

  if (!rawEvents) {
    return (
      <AppShell title="Agenda Tática" subtitle="Carregando planejamento...">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Agenda Tática" subtitle="Planejamento e sincronização competitiva de alto nível">
      <div className="relative min-h-[calc(100vh-120px)]">
        {/* Background Grids & Scanlines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pt-4 gap-6">
            <div className="pt-4" />
            
            <div className="flex items-center gap-6">
              <Button 
                onClick={addNewEvent} 
                className="h-12 gap-3 shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all font-black uppercase tracking-[0.1em] px-8 rounded-xl bg-primary text-black hover:scale-[1.02] active:scale-95 border-none"
              >
                <Plus className="h-5 w-5 stroke-[3px]" /> Novo Registro
              </Button>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Side: Calendar Control */}
              <div className="w-full lg:w-[350px] space-y-6 shrink-0">
                <Card className="border-white/5 bg-black/60 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden relative rounded-2xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/30" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Seletor Temporal</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-white/5 rounded-full text-white/40"><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-white/5 rounded-full text-white/40"><ChevronRight className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tighter text-white uppercase">{viewMode === "day" ? "Fevereiro 2026" : "Semana Atual"}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <div className="grid grid-cols-7 gap-1 text-center mb-6">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((d, i) => (
                        <span key={`header-${d}-${i}`} className="text-[10px] font-black text-white/20 uppercase font-mono">
                          {d[0]}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 28 }).map((_, i) => {
                        const day = i + 1
                        const isSelected = selectedDay === day
                        const hasEvents = (groupedEvents[day]?.length || 0) > 0
                        
                        return (
                          <Button 
                            key={`day-${day}`} 
                            variant="ghost" 
                            onClick={() => {
                              setSelectedDay(day)
                              setViewMode("day")
                            }}
                            className={cn(
                              "h-11 w-11 p-0 text-[12px] font-black font-mono rounded-xl transition-all relative group border border-transparent",
                              isSelected 
                                ? "bg-primary text-black shadow-2xl shadow-primary/40 scale-110 z-10 border-primary" 
                                : "hover:bg-white/5 text-white/40 hover:text-white"
                            )}
                          >
                            {day}
                            {hasEvents && !isSelected && (
                              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
                            )}
                          </Button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>


              </div>

              {/* Right Side: Timeline Display */}
              <div className="flex-1 space-y-8 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/5">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black font-mono">
                        {viewMode === "day" ? "VISÃO DIÁRIA" : "VISÃO SEMANAL"}
                      </Badge>
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-none text-white">
                      {viewMode === "day" ? (
                        <>Timeline <span className="text-primary italic">0{selectedDay} FEV</span></>
                      ) : (
                        <>Semana <span className="text-primary italic">Fev 02-08</span></>
                      )}
                    </h2>
                  </div>
                  <div className="flex gap-1 p-1.5 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-md">
                    <Button 
                      variant={viewMode === "day" ? "secondary" : "ghost"} 
                      onClick={() => setViewMode("day")}
                      className={cn(
                        "h-10 px-6 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all",
                        viewMode === "day" ? "bg-white/10 text-white shadow-xl" : "text-white/30 hover:text-white"
                      )}
                    >
                      <List className="h-4 w-4 mr-2" /> Dia
                    </Button>
                    <Button 
                      variant={viewMode === "week" ? "secondary" : "ghost"} 
                      onClick={() => setViewMode("week")}
                      className={cn(
                        "h-10 px-6 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all",
                        viewMode === "week" ? "bg-white/10 text-white shadow-xl" : "text-white/30 hover:text-white"
                      )}
                    >
                      <LayoutGrid className="h-4 w-4 mr-2" /> Semana
                    </Button>
                  </div>
                </div>

                <div className="min-h-[600px]">
                  {viewMode === "day" ? (
                    <AgendaTimeline 
                      events={events} 
                      onEventClick={handleEventClick} 
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      {[2, 3, 4, 5, 6, 7, 8].map(day => {
                        const dayEvents = groupedEvents[day] || []
                        return (
                          <div key={`week-day-${day}`} className="space-y-4">
                            <div className="flex items-center justify-between px-3">
                              <h3 className={cn(
                                "text-[11px] font-black uppercase tracking-[0.2em]",
                                day === selectedDay ? "text-primary" : "text-white/40"
                              )}>
                                {day === 4 ? "Hoje (04 FEV)" : `${day < 10 ? `0${day}` : day} Fev`}
                              </h3>
                              <div className="h-[2px] flex-1 mx-4 bg-white/5 rounded-full" />
                              <Badge variant="outline" className="text-[10px] font-black font-mono text-white/20 border-white/5 bg-white/[0.02]">
                                {dayEvents.length < 10 ? `0${dayEvents.length}` : dayEvents.length}
                              </Badge>
                            </div>
                            <div className="space-y-3 p-4 rounded-3xl bg-black/40 border border-white/5 min-h-[220px] hover:bg-white/[0.02] transition-all cursor-pointer group/week-day" onClick={() => {
                              setSelectedDay(day)
                              setViewMode("day")
                            }}>
                              {dayEvents.length > 0 ? (
                                dayEvents.slice(0, 3).map((e: AgendaEvent) => (
                                  <div key={`week-e-${e.id}`} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                      <div className="w-1.5 h-8 rounded-full bg-primary/20 group-hover:bg-primary transition-all scale-y-75 group-hover:scale-y-100" />
                                      <div>
                                        <p className="text-[11px] font-black text-white/80 line-clamp-1 uppercase tracking-tight">{e.title}</p>
                                        <p className="text-[9px] font-black font-mono text-white/20 mt-0.5">{e.startTime}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 gap-2 py-10">
                                  <div className="w-8 h-[1px] bg-white" />
                                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Data</p>
                                </div>
                              )}
                              {dayEvents.length > 3 && (
                                <p className="text-center text-[10px] font-black text-primary/40 pt-2 tracking-widest">+ {dayEvents.length - 3} EVENTOS</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DndContext>
        </div>
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <DragOverlay dropAnimation={{
            sideEffects: (event: any) => {
              // @ts-ignore
              event.active.node.style.opacity = "0.5"
            }
          }}>
            {activeEvent ? (
              <div className="scale-[1.02] rotate-1 transition-transform cursor-grabbing opacity-90 shadow-2xl">
                <AgendaEventCard event={activeEvent} />
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}

      <EventDetailSheet 
        event={selectedEvent}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
      />
    </AppShell>
  )
}
