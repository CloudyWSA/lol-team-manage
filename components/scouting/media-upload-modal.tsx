"use client"

import React, { useState, useRef } from "react"
import { useMutation, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, Youtube, Video, ImageIcon, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface MediaUploadModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  teamId: Id<"scoutingTeams">
  onSuccess?: () => void
}

type MediaType = "image" | "video" | "youtube"

export function MediaUploadModal({
  isOpen,
  onOpenChange,
  teamId,
  onSuccess,
}: MediaUploadModalProps) {
  const [type, setType] = useState<MediaType>("image")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [tags, setTags] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const generateUploadUrl = useAction(api.media.generateUploadUrl)
  const saveMedia = useMutation(api.media.saveMedia)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!title) {
      toast.error("Por favor, insira um título")
      return
    }

    if (type !== "youtube" && !selectedFile && !url) {
      toast.error("Por favor, selecione um arquivo ou insira uma URL")
      return
    }

    if (type === "youtube" && !url) {
      toast.error("Por favor, insira a URL do YouTube")
      return
    }

    setIsUploading(true)
    try {
      let storageId: Id<"_storage"> | undefined
      let finalUrl: string | undefined = url

      if (selectedFile && type !== "youtube") {
        // 1. Get upload URL
        const uploadUrl = await generateUploadUrl()
        
        // 2. Upload to Convex
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        })
        
        if (!result.ok) throw new Error("Falha no upload")
        
        const json = await result.json()
        storageId = json.storageId as Id<"_storage">
        finalUrl = undefined // Clear URL if we have storageId
      }

      // 3. Save metadata
      await saveMedia({
        teamId,
        type,
        title,
        description,
        url: finalUrl ?? "", 
        storageId,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      })

      toast.success("Mídia adicionada com sucesso!")
      onSuccess?.()
      onOpenChange(false)
      // Reset state
      setTitle("")
      setDescription("")
      setUrl("")
      setTags("")
      setSelectedFile(null)
      setType("image")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao adicionar mídia")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] flex flex-col bg-[#0A0A0B] border-white/5 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-widest text-white/90">
            Adicionar Mídia
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/60">
            Capture momentos táticos, drafts ou vídeos de gameplay.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 flex-1 overflow-y-auto pr-2">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Tipo de Conteúdo</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "image", icon: ImageIcon, label: "Imagem" },
                { id: "video", icon: Video, label: "Vídeo" },
                { id: "youtube", icon: Youtube, label: "YouTube" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setType(item.id as MediaType)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                    type === item.id 
                      ? "bg-primary/20 border-primary/50 text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]" 
                      : "bg-white/[0.02] border-white/5 text-muted-foreground/40 hover:bg-white/[0.04]"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Título Tático</Label>
            <Input 
              placeholder="Ex: Nível 1 Invaide vs G2" 
              className="bg-white/[0.02] border-white/5 focus:border-primary/50 focus:ring-0 transition-colors h-11 text-sm font-medium"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
              {type === "youtube" ? "Link do YouTube" : "Upload de Arquivo ou URL"}
            </Label>
            
            {type !== "youtube" && (
              <div className="flex flex-col gap-3">
                <Input 
                  placeholder="URL Direta (opcional)" 
                  className="bg-white/[0.02] border-white/5 focus:border-primary/50 focus:ring-0 h-11 text-sm"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={!!selectedFile}
                />
                
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept={type === "image" ? "image/*" : "video/*"}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-24 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2",
                      selectedFile && "border-primary/50 bg-primary/5"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {selectedFile ? (
                      <>
                        <Loader2 className={cn("w-6 h-6 text-primary", isUploading && "animate-spin")} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground/40" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                          Selecionar Arquivo {type === "image" ? "Imagem" : "Vídeo"}
                        </span>
                      </>
                    )}
                  </Button>
                  {selectedFile && (
                    <button 
                      onClick={() => setSelectedFile(null)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/40 hover:bg-black/60 text-white/60 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {type === "youtube" && (
              <Input 
                placeholder="https://youtube.com/watch?v=..." 
                className="bg-white/[0.02] border-white/5 focus:border-primary/50 focus:ring-0 h-11 text-sm"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Descrição Contextual</Label>
            <Textarea
              placeholder="Descreva o que acontece nesta mídia..."
              className="bg-white/[0.02] border-white/5 focus:border-primary/50 focus:ring-0 min-h-[80px] text-sm resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Tags (separadas por vírgula)</Label>
            <Input 
              placeholder="lane-swap, dive, mid-game" 
              className="bg-white/[0.02] border-white/5 focus:border-primary/50 focus:ring-0 h-10 text-xs"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-white/5">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUploading}
            className="bg-primary text-black font-black uppercase tracking-[0.2em] text-[10px] px-8 h-11 hover:scale-105 active:scale-95 transition-transform"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Confirmar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
