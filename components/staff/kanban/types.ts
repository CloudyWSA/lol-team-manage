export type Priority = "Baixa" | "Media" | "Alta" | "Critica"

export interface Task {
  id: string
  title: string
  description?: string
  priority: Priority
  deadline: string
  column: string
  player: string // Keep for backward compatibility or primary player
  assignees: any[] // IDs of users
  comments: number
  observations?: string
  createdAt?: string
}

export interface Column {
  id: string
  title: string
  color: string
}
