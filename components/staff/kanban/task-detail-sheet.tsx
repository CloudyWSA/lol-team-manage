"use client"

import React, { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MessageSquare, 
  User, 
  Tag, 
  StickyNote,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Share2,
  Plus
} from "lucide-react"
import { Task, Priority, Column } from "./types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@/lib/auth-context"
import { Id } from "@/convex/_generated/dataModel"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Check } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TaskDetailSheetProps {
  task: Task | null
  columns: Column[] // Added columns prop
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedTask: Task) => void
  onDelete?: (id: string) => void
}

export function TaskDetailSheet({ task, columns, isOpen, onClose, onUpdate, onDelete }: TaskDetailSheetProps) {
  const { user: currentUser } = useAuth()
  const [localTask, setLocalTask] = useState<Task | null>(task)
  const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false)
  
  // Comments state
  const [newComment, setNewComment] = useState("")
  const comments = useQuery(api.tasks.getComments, localTask?.id ? { taskId: localTask.id as Id<"tasks"> } : "skip")
  const addComment = useMutation(api.tasks.addComment)

  const handleSendComment = async () => {
    if (!localTask?.id || !currentUser?.id || !newComment.trim()) return

    try {
      await addComment({
        taskId: localTask.id as Id<"tasks">,
        userId: currentUser.id as Id<"users">,
        content: newComment,
      })
      setNewComment("")
    } catch (error) {
      console.error("Failed to add comment:", error)
    }
  }

  // Fetch team members
  const teamMembers = useQuery(api.users.listByTeam, currentUser?.teamId ? { teamId: currentUser.teamId as Id<"teams"> } : "skip")
  
  // Filter for staff (coach, analyst) - although user might want anyone, usually tasks are for staff or players.
  // The user explicitly said "staffs", so I'll show all members but maybe filter if they are players? 
  // Let's show all for now but the user said "staffs".
  const staffMembers = teamMembers ? teamMembers.filter(m => m.role !== 'player') : []

  // Only sync from props when the task ID changes or when we first get a task
  useEffect(() => {
    if (task?.id !== localTask?.id) {
      setLocalTask(task)
    }
  }, [task?.id])

  // Debounce the onUpdate call to prevent frequent server syncs while typing
  useEffect(() => {
    if (!localTask || !task) return
    
    // Check if there are actual changes before setting up the timeout
    const hasChanges = 
      localTask.title !== task.title ||
      localTask.description !== task.description ||
      localTask.priority !== task.priority ||
      localTask.deadline !== task.deadline ||
      localTask.column !== task.column ||
      localTask.observations !== task.observations ||
      JSON.stringify(localTask.assignees.slice().sort()) !== JSON.stringify(task.assignees.slice().sort())

    if (!hasChanges) return

    const timer = setTimeout(() => {
      onUpdate(localTask)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [localTask, onUpdate, task])

  if (!localTask) return null

  const handleUpdate = (updates: Partial<Task>) => {
    if (!localTask) return
    setLocalTask(prev => prev ? { ...prev, ...updates } : null)
  }

  const priorityConfig = {
    Alta: "bg-red-500/10 text-red-500 border-red-500/20",
    Media: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Baixa: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Critica: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-card/95 backdrop-blur-xl border-l border-border/40 p-0 overflow-hidden flex flex-col h-full">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 z-50" />
        
        <SheetHeader className="p-6 pb-4 pt-10 shrink-0">
          <SheetTitle className="sr-only">Detalhes da Tarefa: {localTask.title}</SheetTitle>
          <div className="flex items-center gap-2 mb-4">
            <Select 
              value={localTask.priority} 
              onValueChange={(val) => handleUpdate({ priority: val as Priority })}
            >
              <SelectTrigger className={cn(
                "w-fit h-6 text-[10px] font-black uppercase px-2 tracking-widest border",
                priorityConfig[localTask.priority as keyof typeof priorityConfig] || priorityConfig.Baixa
              )}>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Critica">CRÍTICA</SelectItem>
                <SelectItem value="Alta">ALTA</SelectItem>
                <SelectItem value="Media">MÉDIA</SelectItem>
                <SelectItem value="Baixa">BAIXA</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-[10px] font-mono h-5 opacity-70">
              #{localTask.id}
            </Badge>
          </div>
          <Input 
            value={localTask.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            className="text-2xl font-bold tracking-tight leading-tight bg-transparent border-none p-0 focus-visible:ring-0 placeholder:opacity-30 h-auto"
            placeholder="Título da Tarefa"
          />
          <SheetDescription className="text-muted-foreground pt-1 flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs">
              <Clock className="h-3 w-3" />
              Criada em {localTask.createdAt || "Hoje"}
            </span>
          </SheetDescription>
        </SheetHeader>

        <Separator className="bg-border/30 shrink-0" />

        <ScrollArea className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6 space-y-8 pb-10">
            {/* Status & Assignment */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                  <Tag className="h-3 w-3" /> Status / Coluna
                </label>
                <Select 
                  value={localTask.column} 
                  onValueChange={(val) => handleUpdate({ column: val })}
                >
                  <SelectTrigger className="w-full h-8 text-[11px] font-bold uppercase tracking-tight bg-muted/20 border-border/20">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.title.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                  <User className="h-3 w-3" /> Responsáveis
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {localTask.assignees.map((assigneeId, i) => {
                    const member = staffMembers.find(m => m._id === assigneeId)
                    if (!member) return null
                    return (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="text-[10px] font-bold h-6 gap-2 pr-1 group/badge"
                      >
                        {member.name.charAt(0).toUpperCase()}
                        <span className="opacity-70">{member.name}</span>
                        <button 
                          onClick={() => {
                            const newAssignees = localTask.assignees.filter(id => id !== assigneeId)
                            handleUpdate({ assignees: newAssignees })
                          }}
                          className="hover:text-destructive transition-colors ml-1"
                        >
                          <Plus className="h-3 w-3 rotate-45" />
                        </button>
                      </Badge>
                    )
                  })}
                  
                  <Popover open={isAssigneePopoverOpen} onOpenChange={setIsAssigneePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="h-6 w-6 rounded-full border-dashed">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0 bg-card border-border/40 shadow-2xl" side="bottom" align="start">
                      <Command className="bg-transparent">
                        <CommandInput placeholder="Buscar staff..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>Nenhum staff encontrado.</CommandEmpty>
                          <CommandGroup>
                            {staffMembers.map((member) => (
                              <CommandItem
                                key={member._id}
                                value={member.name}
                                onSelect={() => {
                                  const isAssigned = localTask.assignees.includes(member._id)
                                  const newAssignees = isAssigned
                                    ? localTask.assignees.filter(id => id !== member._id)
                                    : [...localTask.assignees, member._id]
                                  
                                  handleUpdate({ assignees: newAssignees })
                                  setIsAssigneePopoverOpen(false)
                                }}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                                    {member.name.charAt(0)}
                                  </div>
                                  <span className="text-xs">{member.name}</span>
                                </div>
                                {localTask.assignees.includes(member._id) && (
                                  <Check className="h-3 w-3 text-primary" />
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                <CalendarIcon className="h-3 w-3" /> Prazo de Entrega
              </label>
              <div className={cn(
                "p-3 rounded-xl border border-border/30 bg-muted/20 flex items-center gap-3",
                (localTask.deadline === new Date().toISOString().split('T')[0]) ? "border-orange-500/50 bg-orange-500/5 font-bold" : ""
              )}>
                <Input 
                  type="date"
                  value={localTask.deadline}
                  onChange={(e) => handleUpdate({ deadline: e.target.value })}
                  className="bg-transparent border-none p-0 focus-visible:ring-0 text-sm h-auto font-medium [color-scheme:dark]"
                />
                {(localTask.deadline === new Date().toISOString().split('T')[0]) && (
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-none animate-pulse shrink-0">
                    URGENTE
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3" /> Detalhes da Tarefa
              </label>
              <Textarea 
                value={localTask.description}
                onChange={(e) => handleUpdate({ description: e.target.value })}
                placeholder="Adicione uma descrição detalhada..."
                className="text-[13px] leading-relaxed text-muted-foreground bg-muted/5 p-4 rounded-xl border border-border/10 italic min-h-[100px] focus-visible:ring-primary/20"
              />
            </div>

            {/* Observations */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                <StickyNote className="h-3 w-3" /> Observações Táticas
              </label>
              <div className="relative group">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/40 rounded-l-xl" />
                <Textarea 
                  value={localTask.observations}
                  onChange={(e) => handleUpdate({ observations: e.target.value })}
                  placeholder="Notas estratégicas para o time..."
                  className="text-[13px] text-foreground/80 bg-muted/10 p-4 pl-6 rounded-xl border border-border/20 focus-visible:ring-yellow-500/20 min-h-[80px]"
                />
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3" /> Comentários ({comments?.length || 0})
                </label>
              </div>
              
              <div className="bg-muted/10 rounded-xl border border-border/20 p-4 space-y-4">
                 {/* Input Area */}
                 <div className="flex gap-3">
                   <Avatar className="h-8 w-8 border border-border/30">
                     {currentUser?.avatar && <AvatarImage src={currentUser.avatar} />}
                     <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                       {currentUser?.name?.charAt(0).toUpperCase() || "?"}
                     </AvatarFallback>
                   </Avatar>
                   <div className="flex-1 space-y-2">
                     <Textarea 
                       value={newComment}
                       onChange={(e) => setNewComment(e.target.value)}
                       placeholder="Escreva um comentário..." 
                       className="min-h-[80px] text-[13px] bg-background/50 border-border/20 focus-visible:ring-primary/20 resize-none"
                     />
                     <div className="flex justify-end">
                       <Button 
                         size="sm" 
                         className="h-7 text-[10px] font-bold tracking-wide"
                         onClick={handleSendComment}
                         disabled={!newComment.trim()}
                       >
                         ENVIAR COMENTÁRIO
                       </Button>
                     </div>
                   </div>
                 </div>

                 <Separator className="bg-border/20" />

                 {/* Comments List */}
                 <div className="space-y-4">
                   {!comments ? (
                     <div className="text-center py-4 text-xs text-muted-foreground animate-pulse">
                       Carregando comentários...
                     </div>
                   ) : comments.length === 0 ? (
                     <div className="text-center py-4 text-xs text-muted-foreground italic">
                       Nenhum comentário na tarefa.
                     </div>
                   ) : (
                     comments.map((comment, i) => ( // Using index as key fallback if id is missing, but convex should provide _id
                       <div key={comment._id} className="flex gap-3 group">
                         <Avatar className="h-7 w-7 border border-border/30 mt-1">
                           {comment.authorAvatar && <AvatarImage src={comment.authorAvatar} />}
                           <AvatarFallback className="text-[9px] font-bold bg-muted text-muted-foreground">
                             {comment.authorName?.charAt(0).toUpperCase() || "?"}
                           </AvatarFallback>
                         </Avatar>
                         <div className="flex-1 space-y-1">
                           <div className="flex items-center justify-between">
                             <span className="text-[11px] font-bold text-foreground/90">
                               {comment.authorName || "Usuário Desconhecido"}
                             </span>
                             <span className="text-[9px] text-muted-foreground tabular-nums">
                               {new Date(comment.createdAt).toLocaleDateString()} às {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                           </div>
                           <p className="text-[12px] text-muted-foreground/80 leading-relaxed bg-muted/5 p-2 rounded-lg border border-border/10">
                             {comment.content}
                           </p>
                         </div>
                       </div>
                     ))
                   )}
                 </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 bg-card border-t border-border/30 flex gap-2 shrink-0">
          <Button 
            className="flex-1 gap-2 font-bold tracking-tight shadow-md"
            onClick={() => {
              const doneColumn = columns.find(c => c.title === "Concluído" || c.title === "Done") || columns[columns.length - 1]
              if (doneColumn) {
                handleUpdate({ column: doneColumn.id })
              }
            }}
          >
            <CheckCircle2 className="h-4 w-4" /> CONCLUIR TAREFA
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 text-destructive hover:bg-destructive/10"
            onClick={() => localTask.id && onDelete?.(localTask.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
