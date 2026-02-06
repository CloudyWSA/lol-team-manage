"use client"

import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { KanbanColumn } from "./kanban-column"
import { Column, Task } from "./types"

interface SortableColumnProps {
  column: Column
  tasks: Task[]
  onAddTask?: (columnId: string) => void
  onTaskClick?: (task: Task) => void
  onUpdateTitle?: (id: string, title: string) => void
  onDeleteColumn?: (id: string) => void
}

export function SortableColumn({ 
  column, 
  tasks, 
  onAddTask, 
  onTaskClick, 
  onUpdateTitle,
  onDeleteColumn 
}: SortableColumnProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  })

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex flex-col gap-4 bg-primary/5 rounded-2xl border-2 border-primary/20 border-dashed min-h-[500px] w-[300px] shrink-0 relative group/dragging shadow-[0_0_40px_-10px_rgba(var(--primary),0.3)] transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={style} className="w-[300px] shrink-0">
      <KanbanColumn
        column={column}
        tasks={tasks}
        onAddTask={onAddTask}
        onTaskClick={onTaskClick}
        onUpdateTitle={onUpdateTitle}
        onDeleteColumn={onDeleteColumn}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}
