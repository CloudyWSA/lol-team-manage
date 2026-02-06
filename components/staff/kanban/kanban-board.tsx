"use client"

import React, { useState, useEffect } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
  closestCorners,
  rectIntersection,
  pointerWithin,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { Column, Task } from "./types"
import { createPortal } from "react-dom"
import { SortableColumn } from "./sortable-column"

interface KanbanBoardProps {
  tasks: Task[]
  columns: Column[]
  onTasksChange: (tasks: Task[]) => void
  onColumnsChange: (columns: Column[]) => void
  onTaskClick?: (task: Task) => void
  onColumnUpdate?: (id: string, title: string) => void
  onColumnDelete?: (id: string) => void
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
}

export function KanbanBoard({ 
  tasks, 
  columns, 
  onTasksChange, 
  onColumnsChange, 
  onTaskClick,
  onColumnUpdate,
  onColumnDelete 
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [activeColumn, setActiveColumn] = useState<Column | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const columnIds = columns.map(c => c.id)

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task)
    }
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column)
    }
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveATask = active.data.current?.type === "Task"
    const isOverATask = over.data.current?.type === "Task"
    const isOverAColumn = over.data.current?.type === "Column"
    const isActiveAColumn = active.data.current?.type === "Column"

    // Real-time Column sorting
    if (isActiveAColumn) {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId)
      const overColumnIndex = columns.findIndex((col) => col.id === overId)

      if (activeColumnIndex !== -1 && overColumnIndex !== -1) {
        onColumnsChange(arrayMove(columns, activeColumnIndex, overColumnIndex))
      }
      return
    }

    if (!isActiveATask) return

    // Dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      const activeIndex = tasks.findIndex((t) => t.id === activeId)
      const overIndex = tasks.findIndex((t) => t.id === overId)

      if (tasks[activeIndex].column !== tasks[overIndex].column) {
        const newTasks = [...tasks]
        newTasks[activeIndex] = {
          ...newTasks[activeIndex],
          column: tasks[overIndex].column,
        }
        onTasksChange(arrayMove(newTasks, activeIndex, overIndex))
        return
      }

      onTasksChange(arrayMove(tasks, activeIndex, overIndex))
    }

    // Dropping a Task over a Column
    if (isActiveATask && isOverAColumn) {
      const activeIndex = tasks.findIndex((t) => t.id === activeId)
      const newTasks = [...tasks]
      
      // If moving to a different column
      if (newTasks[activeIndex].column !== String(overId)) {
        newTasks[activeIndex] = {
          ...newTasks[activeIndex],
          column: String(overId),
        }
        onTasksChange(arrayMove(newTasks, activeIndex, activeIndex))
      }
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    setActiveColumn(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent min-h-[600px]">
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          {columns.map((col) => (
            <SortableColumn
              key={col.id}
              column={col}
              tasks={tasks.filter((t) => t.column === col.id)}
              onTaskClick={onTaskClick}
              onUpdateTitle={onColumnUpdate}
              onDeleteColumn={onColumnDelete}
            />
          ))}
        </SortableContext>
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask ? (
              <div className="w-[280px]">
                <KanbanCard task={activeTask} isOverlay />
              </div>
            ) : null}
            {activeColumn ? (
              <div className="w-[300px]">
                <KanbanColumn
                  column={activeColumn}
                  tasks={tasks.filter((t) => t.column === activeColumn.id)}
                  isOverlay
                />
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  )
}
