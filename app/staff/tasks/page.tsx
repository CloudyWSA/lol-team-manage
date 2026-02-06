"use client"

import React, { useState, useMemo } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { KanbanBoard } from "@/components/staff/kanban/kanban-board"
import { TaskDetailSheet } from "@/components/staff/kanban/task-detail-sheet"
import { Column, Task } from "@/components/staff/kanban/types"
import { useAuth } from "@/lib/auth-context"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

export default function StaffTasksPage() {
  const { user } = useAuth()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Convex Data
  const boardData = useQuery(api.tasks.getBoard, user?.teamId ? { teamId: user.teamId as Id<"teams"> } : "skip")
  const createTask = useMutation(api.tasks.createTask)
  const moveTask = useMutation(api.tasks.moveTask)
  const updateTaskMutation = useMutation(api.tasks.updateTask)
  const deleteTaskMutation = useMutation(api.tasks.deleteTask)
  
  // Column mutations
  const createColumnMutation = useMutation(api.tasks.createColumn)
  const updateColumnMutation = useMutation(api.tasks.updateColumn)
  const deleteColumnMutation = useMutation(api.tasks.deleteColumn)
  const initializeColumnsMutation = useMutation(api.tasks.initializeDefaultColumns)

  // Map Convex data to Kanban types
  const columns: Column[] = useMemo(() => {
    if (!boardData) return []
    return boardData.columns.map(c => ({
      id: c._id,
      title: c.title,
      color: c.color
    }))
  }, [boardData])

  const tasks: Task[] = useMemo(() => {
    if (!boardData) return []
    return boardData.tasks.map(t => ({
      id: t._id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      deadline: t.deadline,
      column: t.columnId,
      player: "Team", // Placeholder or fetch user
      assignees: t.assignees,
      comments: t.comments,
      observations: t.observations,
    }))
  }, [boardData])

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id)
    setIsSheetOpen(true)
  }

  const handleTaskUpdate = async (updatedTask: Task) => {
    await updateTaskMutation({
      id: updatedTask.id as Id<"tasks">,
      title: updatedTask.title,
      description: updatedTask.description,
      priority: updatedTask.priority,
      deadline: updatedTask.deadline,
      assignees: updatedTask.assignees as Id<"users">[],
      observations: updatedTask.observations,
      columnId: updatedTask.column as Id<"columns">,
    })
  }

  const handleTaskDelete = async (id: string) => {
    await deleteTaskMutation({ id: id as Id<"tasks"> })
    setIsSheetOpen(false)
  }

  const handleTasksChange = async (newTasks: Task[]) => {
    const movedTask = newTasks.find((t, i) => t.column !== tasks.find(ot => ot.id === t.id)?.column)
    if (movedTask) {
      await moveTask({ 
        id: movedTask.id as Id<"tasks">, 
        columnId: movedTask.column as Id<"columns"> 
      })
    }
  }

  const addNewTask = async () => {
    if (!user || !columns.length) return
    
    const newId = await createTask({
      title: "Nova Atividade",
      priority: "Media",
      deadline: "A definir",
      columnId: columns[0].id as Id<"columns">,
      assignees: [],
      teamId: user.teamId as Id<"teams">,
    })
    
    setSelectedTaskId(newId)
    setIsSheetOpen(true)
  }

  const handleCreateColumn = async () => {
    if (!user) return
    await createColumnMutation({
      title: "Nova Coluna",
      color: "border-primary",
      order: columns.length,
      teamId: user.teamId as Id<"teams">
    })
  }

  const handleInitializeBoard = async () => {
    if (!user) return
    await initializeColumnsMutation({ teamId: user.teamId as Id<"teams"> })
  }

  const handleColumnUpdate = async (id: string, title: string) => {
    await updateColumnMutation({
      id: id as Id<"columns">,
      title
    })
  }

  const handleColumnDelete = async (id: string) => {
    // Optionally: check if there are tasks and confirm? 
    // The mutation will just delete it for now as planned.
    await deleteColumnMutation({ id: id as Id<"columns"> })
  }

  if (!boardData) {
    return (
      <AppShell title="Operações Táticas" subtitle="Carregando dados...">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Operações Táticas" subtitle="Gerenciamento de fluxo de trabalho de alta performance">
      <div className="relative min-h-[calc(100vh-120px)]">
        {/* Background Grids & Scanlines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pt-4 gap-6">
            <div className="pt-4" />
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={handleCreateColumn}
                className="h-12 gap-3 border-white/10 hover:border-primary/50 text-white/70 hover:text-white bg-white/5 font-bold uppercase tracking-widest px-6 rounded-xl transition-all"
              >
                <Plus className="h-4 w-4" /> Nova Coluna
              </Button>
              <Button 
                onClick={addNewTask} 
                className="h-12 gap-3 shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all font-black uppercase tracking-[0.1em] px-8 rounded-xl bg-primary text-black hover:scale-[1.02] active:scale-95 border-none"
              >
                <Plus className="h-5 w-5 stroke-[3px]" /> Nova Atividade
              </Button>
            </div>
          </div>

          {columns.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Plus className="h-10 w-10 text-primary/40" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Quadro Vazio</h2>
              <p className="text-muted-foreground mb-8 max-w-sm">
                Ainda não existem colunas configuradas para o board da sua equipe.
              </p>
              <Button 
                onClick={handleInitializeBoard}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest px-10 rounded-2xl h-14"
              >
                Inicializar Board Padrão
              </Button>
            </div>
          ) : (
            <KanbanBoard 
              tasks={tasks} 
              columns={columns} 
              onTasksChange={handleTasksChange}
              onColumnsChange={() => {}} // TODO: add column reorder mutation
              onTaskClick={handleTaskClick}
              onColumnUpdate={handleColumnUpdate}
              onColumnDelete={handleColumnDelete}
            />
          )}

          <TaskDetailSheet 
            task={selectedTask}
            columns={columns}
            isOpen={isSheetOpen}
            onClose={() => setIsSheetOpen(false)}
            onUpdate={handleTaskUpdate}
            onDelete={handleTaskDelete}
          />
        </div>
      </div>
    </AppShell>
  )
}
