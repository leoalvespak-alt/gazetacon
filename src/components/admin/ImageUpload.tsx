"use client"
import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, ImageIcon, X } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUpload({ value, onChange, label = "Imagem de Capa" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione uma imagem válida.")
        return
      }

      // 1. Create a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // 2. Upload to Supabase Storage Bucket 'blog-images'
      const { data, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file)

      if (uploadError) {
        // If error is 404, the bucket probably doesn't exist
        if (uploadError.message.includes("not found")) {
            throw new Error("O bucket 'blog-images' não foi encontrado no Supabase. Verifique as instruções.")
        }
        throw uploadError
      }

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)

      onChange(publicUrl)
      toast.success("Imagem carregada com sucesso!")
    } catch (error: any) {
      console.error("Erro no upload:", error)
      toast.error(error.message || "Erro ao fazer upload da imagem.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const removeImage = () => {
    onChange("")
  }

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {value ? (
        <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-muted group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button 
                type="button" 
                variant="destructive" 
                size="sm" 
                onClick={removeImage}
            >
                <X className="h-4 w-4 mr-2" /> Remover
            </Button>
          </div>
        </div>
      ) : (
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 cursor-pointer transition-colors min-h-[150px]"
        >
            {uploading ? (
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            ) : (
                <Upload className="h-10 w-10 text-muted-foreground" />
            )}
            <div className="text-center">
                <p className="text-sm font-medium">Clique para fazer upload</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou WEBP até 5MB</p>
            </div>
        </div>
      )}

      {/* URL Input option as fallback/direct URL */}
      <div className="flex gap-2 items-center">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Ou link direto:</span>
          <Input 
            placeholder="https://exemplo.com/imagem.jpg" 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className="h-8 text-xs"
          />
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUpload} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  )
}
