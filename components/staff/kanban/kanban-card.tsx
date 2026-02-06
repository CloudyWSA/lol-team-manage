"use client"

import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  MessageSquare, 
  GripVertical,
  Calendar,
  AlertTriangle,
  Users
} from "lucide-react"
import { Task } from "./types"
import { cn } from "@/lib/utils"

interface KanbanCardProps {
  task: Task
  onClick?: (task: Task) => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  isOverlay?: boolean
}

export function KanbanCard({ task, onClick, dragHandleProps, isOverlay }: KanbanCardProps) {
  // We need to fetch the users for the assignees. 
  // Since we can't call hooks inside a loop, we should probably fetch the team members once in the parent board 
  // or fetch robustly here. For now, let's fetch individual users if the list is small, 
  // OR better: rely on the parent ensuring the data is available? 
  // Actually, Convex is fast. Let's try fetching the team members in the card context if possible, 
  // OR just assume we can get them.
  // Ideally, the board should pass down a map of userId -> User object to avoid N+1 queries.
  // But for this task request, let's just make it work.
  // Wait, `api.users.listByTeam` is already cached by Convex.
  
  // Actually, the user request implies they are not seeing it. 
  // The backend was saving IDs. The frontend was expecting... strings?
  // Previous code: `task.assignees.map((assignee: string, idx: number) => (`
  // If `assignee` is an ID, `assignee.charAt(0)` is just the first char of the ID, which is useless.
  
  // Let's use a helper component for the avatar to isolate the query.
  
  const priorityConfig = {
    Alta: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    Media: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Baixa: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    Critica: "bg-purple-600/30 text-purple-300 border-purple-500/40 font-black",
  }

  return (
    <Card 
      className={cn(
        "group cursor-pointer hover:border-primary/50 transition-all bg-black/60 backdrop-blur-xl border-white/5 shadow-2xl hover:shadow-primary/5 relative overflow-hidden rounded-xl",
        !isOverlay && "active:scale-[0.98] active:rotate-1",
        isOverlay && "rotate-2 scale-105"
      )}
      onClick={() => onClick?.(task)}
    >
      {/* Technical accent lines */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-bl-full opacity-30 group-hover:opacity-100 transition-opacity" />
      
      <CardContent className="p-4 space-y-3 relative z-10">
        <div className="flex items-start justify-between">
          <Badge className={cn(
            "text-[9px] font-black px-2 h-[18px] tracking-[0.1em] border-none font-mono uppercase",
            priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.Baixa
          )}>
            {task.priority === 'Critica' && <AlertTriangle className="h-3 w-3 mr-1.5" />}
            {task.priority}
          </Badge>
          
          <div 
            {...dragHandleProps}
            className="p-1 hover:bg-white/10 rounded-md transition-all cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-white/10 group-hover:text-white/40 transition-colors" />
          </div>
        </div>
        
        <h4 className="text-[13px] font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tight text-white/90">
          {task.title}
        </h4>

        {task.description && (
          <p className="text-[11px] text-white/40 line-clamp-2 opacity-70 leading-relaxed font-medium">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-1.5 text-[10px] font-black font-mono tracking-tighter uppercase",
              task.deadline.includes("Hoje") ? "text-amber-400" : "text-white/30"
            )}>
              <Calendar className="h-3 w-3" />
              {task.deadline}
            </div>
            
            {task.comments > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-white/20 font-mono">
                <MessageSquare className="h-3 w-3" />
                {task.comments}
              </div>
            )}
          </div>

          <div className="flex -space-x-2 overflow-hidden">
            {task.assignees && task.assignees.length > 0 ? (
              task.assignees.map((assigneeId: string, idx: number) => (
                <AssigneeAvatar key={idx} userId={assigneeId} />
              ))
            ) : (
               null
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function AssigneeAvatar({ userId }: { userId: string }) {
  const user = useQuery(api.users.getById, { id: userId as Id<"users"> })

  if (user === undefined) return (
    <div className="h-6 w-6 rounded-full bg-white/5 border-2 border-[#121212] flex items-center justify-center text-[9px] font-black uppercase text-white/60 shadow-lg animate-pulse" />
  )

  if (user === null) return null // User not found

  const hasAvatar = Boolean(user.avatar && user.avatar.length > 0);
  const initial = user.name && user.name.length > 0 ? user.name.charAt(0) : "?";

  return (
    <Avatar className="h-6 w-6 border-2 border-[#121212] shadow-lg bg-zinc-900">
      {hasAvatar && <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />}
      <AvatarFallback className="bg-primary/20 text-[9px] font-black uppercase text-primary flex items-center justify-center">
        {initial}
      </AvatarFallback>
    </Avatar>
  )
}
