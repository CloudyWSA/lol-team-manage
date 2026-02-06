"use client"

import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Task } from "./types"
import { KanbanCard } from "./kanban-card"

interface SortableCardProps {
  task: Task
  onClick?: (task: Task) => void
}

export function SortableCard({ task, onClick }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 border-2 border-primary/50 border-dashed rounded-xl h-[120px] mb-3 bg-primary/5"
      />
    )
  }

  return (
    <div ref={setNodeRef} style={style}>
      <KanbanCard 
        task={task} 
        onClick={onClick} 
        dragHandleProps={{ ...attributes, ...listeners }} 
      />
    </div>
  )
}
