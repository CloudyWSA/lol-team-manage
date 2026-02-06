"use client"

import React, { useState, useRef, useEffect } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus, GripHorizontal } from "lucide-react"
import { KanbanCard } from "./kanban-card"
import { Column, Task } from "./types"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { SortableCard } from "./sortable-card"

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  onAddTask?: (columnId: string) => void
  onTaskClick?: (task: Task) => void
  onUpdateTitle?: (id: string, title: string) => void
  onDeleteColumn?: (id: string) => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  isOverlay?: boolean
}

export function KanbanColumn({ 
  column, 
  tasks, 
  onAddTask, 
  onTaskClick, 
  onUpdateTitle, 
  onDeleteColumn,
  dragHandleProps,
  isOverlay 
}: KanbanColumnProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(column.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleTitleSubmit = () => {
    setIsEditing(false)
    if (title.trim() !== column.title) {
      onUpdateTitle?.(column.id, title)
    }
  }

  const taskIds = tasks.map((t) => t.id)

  return (
    <div 
      className={cn(
        "flex flex-col gap-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 p-2 min-h-[500px] group/column shadow-2xl shadow-black/50",
        isOverlay && "rotate-1 scale-[1.02] opacity-80 backdrop-blur-lg border-primary/20"
      )}
    >
      <div className={cn(
        "flex items-center justify-between p-4 border-b rounded-t-xl transition-all bg-white/[0.02]",
        column.color.replace('border-', 'border-b-')
      )}>
        <div className="flex items-center gap-3 flex-1 mr-2">
          <div 
            {...dragHandleProps}
            className="p-1.5 hover:bg-white/10 rounded transition-colors cursor-grab active:cursor-grabbing opacity-30 hover:opacity-100"
          >
            <GripHorizontal className="h-3 w-3 text-white/50" />
          </div>
          
          {isEditing ? (
            <Input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
              className="h-7 py-0 px-2 text-[12px] font-black uppercase tracking-[0.1em] bg-black/60 border-primary/30 focus-visible:ring-1 focus-visible:ring-primary/50 font-mono"
            />
          ) : (
            <h3 
              onClick={() => setIsEditing(true)}
              className="text-[12px] font-black uppercase tracking-[0.15em] flex items-center gap-3 cursor-pointer hover:text-primary transition-all whitespace-nowrap overflow-hidden text-ellipsis font-mono text-white/90"
            >
              <span className="opacity-40 font-mono text-[10px]">#</span>
              {column.title}
              <Badge variant="outline" className="text-[10px] font-mono h-[18px] px-2 opacity-30 bg-black/40 border-white/10 text-white rounded-full">
                {tasks.length}
              </Badge>
            </h3>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 shrink-0 rounded-full">
              <MoreHorizontal className="h-4 w-4 opacity-40 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black/90 border-white/10 text-white font-mono">
            <DropdownMenuItem 
              onClick={() => setIsEditing(true)}
              className="text-[10px] font-black uppercase tracking-widest focus:bg-white/10 focus:text-primary cursor-pointer"
            >
              Renomear
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDeleteColumn?.(column.id)}
              className="text-[10px] font-black uppercase tracking-widest focus:bg-red-500/20 focus:text-red-500 cursor-pointer text-red-400"
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-3 p-2">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
        
        {!isOverlay && (
          <Button 
            variant="ghost" 
            onClick={() => onAddTask?.(column.id)}
            className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-primary border border-dashed border-white/5 h-12 bg-white/[0.01] hover:bg-white/[0.03] transition-all mt-2 group/btn rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2 group_hover/btn:scale-110 transition-transform" /> 
            REGISTRAR ATIVIDADE
          </Button>
        )}
      </div>
    </div>
  )
}
