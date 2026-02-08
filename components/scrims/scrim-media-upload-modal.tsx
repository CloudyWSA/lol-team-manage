"use client"

import React, { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Check, Video, Link as LinkIcon } from "lucide-react"
import { toast } from "sonner"

interface ScrimMediaUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (data: any) => void
}

export function ScrimMediaUploadModal({ isOpen, onClose, onUpload }: ScrimMediaUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [mediaUrl, setMediaUrl] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleConfirm = () => {
    if (!file && !mediaUrl) {
      toast.error("Selecione um arquivo ou insira um link")
      return
    }
    onUpload({ file, url: mediaUrl })
    toast.success("Mídia adicionada com sucesso!")
    onClose()
    setFile(null)
    setMediaUrl("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Mídia (VODs & POVs)</DialogTitle>
          <DialogDescription>
            Faça upload de vídeos, fotos ou insira links externos (YouTube, Twitch, etc).
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Link Externo</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="https://youtube.com/watch?v=..." 
                className="pl-9 bg-muted/20"
                value={mediaUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMediaUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold">
              <span className="bg-background px-2 text-muted-foreground tracking-widest">ou upload de arquivo</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 bg-muted/10 hover:bg-muted/20 transition-colors border-border/50">
            <Upload className="h-8 w-8 mb-2 text-primary/50" />
            <Label htmlFor="file-upload" className="cursor-pointer text-sm font-medium hover:text-primary transition-colors">
              {file ? file.name : "Clique para selecionar arquivo"}
            </Label>
            <p className="text-[10px] text-muted-foreground mt-1">MP4, MOV, JPG, PNG (Max 50MB)</p>
            <Input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              onChange={handleFileChange} 
              accept="video/*,image/*"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!file && !mediaUrl.trim()} className="bg-primary hover:bg-primary/90">
            <Check className="mr-2 h-4 w-4" /> Adicionar Mídia
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
