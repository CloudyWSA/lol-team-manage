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
import { Upload, FileType, Check, Loader2 } from "lucide-react"
import { performOCR } from "@/lib/utils/ocr"
import { toast } from "sonner"

interface ScrimMediaUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (data: any) => void
}

export function ScrimMediaUploadModal({ isOpen, onClose, onUpload }: ScrimMediaUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleProcessOCR = async () => {
    if (!file) return
    setIsProcessing(true)
    try {
      // In a real app, we'd upload to storage first. 
      // For this reproduction, we'll simulate processing a local URL
      const imageUrl = URL.createObjectURL(file)
      const text = await performOCR(imageUrl)
      setOcrResult(text)
      toast.success("OCR concluído!")
    } catch (error) {
      toast.error("Erro ao processar imagem")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirm = () => {
    onUpload({ file, ocrResult })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload de Mídia / Screenshot</DialogTitle>
          <DialogDescription>
            Faça upload de screenshots de placar ou links de VODs.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 bg-muted/20">
            <Upload className="h-8 w-8 mb-2 text-primary" />
            <Label htmlFor="file-upload" className="cursor-pointer text-sm font-medium hover:text-primary transition-colors">
              Clique para selecionar ou arraste
            </Label>
            <Input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              onChange={handleFileChange} 
              accept="image/*"
            />
            {file && <p className="mt-2 text-xs font-mono">{file.name}</p>}
          </div>

          {file && !ocrResult && (
            <Button 
              className="w-full" 
              onClick={handleProcessOCR} 
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileType className="mr-2 h-4 w-4" />}
              Analisar Placar com OCR
            </Button>
          )}

          {ocrResult && (
            <div className="rounded-lg border border-border/50 bg-muted/50 p-3">
              <p className="text-[10px] font-black uppercase text-primary mb-2">Resultado da Análise</p>
              <pre className="text-[10px] max-h-32 overflow-y-auto font-mono whitespace-pre-wrap">
                {ocrResult}
              </pre>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!file && !ocrResult}>
            <Check className="mr-2 h-4 w-4" /> Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
