import { LucideIcon } from "lucide-react"

export type EventType = "Review" | "Treino" | "Estratégia" | "1-on-1" | "Media" | "Scrim" | "Psicólogo" | "Nutricionista" | "Fisioterapeuta" | "Médico"

export type EventStatus = "Confirmado" | "Pendente" | "Cancelado"

export interface AgendaEvent {
  id: string
  title: string
  description?: string
  startTime: string // Format: "HH:mm"
  endTime: string   // Format: "HH:mm"
  type: string      // Flexible for now or use EventType
  status: string    // Flexible for now or use EventStatus
  location: string
  assignees: string[]
  observations?: string
  priority: "Baixa" | "Media" | "Alta" | "Critica"
  date: string      // Added
  createdAt?: string
}

export interface DaySchedule {
  date: string
  events: AgendaEvent[]
}
