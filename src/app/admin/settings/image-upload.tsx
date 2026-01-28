"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase-browser"
import { toast } from "sonner"

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  label: string
  bucketName?: string
}

export function ImageUpload({ value, onChange, label, bucketName = "uploads" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const supabase = createClient()
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `settings/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      onChange(publicUrl)
      toast.success("Imagem enviada com sucesso")
    } catch (error) {
      console.error(error)
      const message = error instanceof Error ? error.message : "Erro desconhecido"
      toast.error("Erro ao enviar imagem: " + message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    onChange(null)
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </div>
      
      {value ? (
        <div className="relative w-40 h-40 border rounded-lg overflow-hidden group bg-muted">
          <Image 
            src={value} 
            alt="Preview" 
            fill 
            className="object-contain p-2" 
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="destructive" size="icon" onClick={handleRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-40 h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
            <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-xs">Sem imagem</span>
          </div>
          <div>
            <Button disabled={uploading} variant="outline" className="relative" type="button">
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload Imagem
              <Input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleUpload}
                disabled={uploading}
              />
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Recomendado: PNG ou SVG transparente.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
