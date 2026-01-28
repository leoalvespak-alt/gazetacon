"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus" // Correção do import
import ExtensionBubbleMenu from "@tiptap/extension-bubble-menu"
import ExtensionFloatingMenu from "@tiptap/extension-floating-menu"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Highlight from "@tiptap/extension-highlight"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Placeholder from "@tiptap/extension-placeholder"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import CharacterCount from "@tiptap/extension-character-count"
import { common, createLowlight } from "lowlight"
import { useCallback, useState } from "react"
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Undo,
  Redo,
  Minus,
  Type,
  Palette,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const lowlight = createLowlight(common)

interface RichEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
  "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
  "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc",
]

const HIGHLIGHT_COLORS = [
  { name: "Amarelo", color: "#fef08a" },
  { name: "Verde", color: "#bbf7d0" },
  { name: "Azul", color: "#bfdbfe" },
  { name: "Rosa", color: "#fbcfe8" },
  { name: "Laranja", color: "#fed7aa" },
]

export function RichEditor({ content, onChange, placeholder = "Comece a escrever seu artigo..." }: RichEditorProps) {
  const [linkUrl, setLinkUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full mx-auto my-4",
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      CharacterCount,
      ExtensionBubbleMenu.configure({
        element: null, // Será gerenciado pelo componente React
      }),
      ExtensionFloatingMenu.configure({
        element: null, // Será gerenciado pelo componente React
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-lg dark:prose-invert max-w-none min-h-[400px] focus:outline-none px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const addLink = useCallback(() => {
    if (!editor || !linkUrl) return
    
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
    }
    setLinkUrl("")
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return
    editor.chain().focus().setImage({ src: imageUrl }).run()
    setImageUrl("")
  }, [editor, imageUrl])

  if (!editor) {
    return (
      <div className="border rounded-lg p-4 min-h-[500px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando editor...</div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar Principal */}
      <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <Toggle
            size="sm"
            pressed={false}
            onPressedChange={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            aria-label="Desfazer"
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={false}
            onPressedChange={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            aria-label="Refazer"
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Headings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 h-8 px-2">
              <Type className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Títulos</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
              <span className="text-base">Parágrafo</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <Heading1 className="mr-2 h-4 w-4" />
              <span className="text-xl font-bold">Título 1</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 className="mr-2 h-4 w-4" />
              <span className="text-lg font-bold">Título 2</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 className="mr-2 h-4 w-4" />
              <span className="text-base font-bold">Título 3</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Formatação Básica */}
        <div className="flex items-center gap-0.5">
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            aria-label="Negrito"
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Itálico"
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("underline")}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Sublinhado"
            className="h-8 w-8 p-0"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("strike")}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Tachado"
            className="h-8 w-8 p-0"
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Cores */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 h-8 px-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Cor</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium mb-2">Cor do Texto</p>
                <div className="grid grid-cols-10 gap-1">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "w-5 h-5 rounded border border-border hover:scale-110 transition-transform",
                        editor.isActive("textStyle", { color }) && "ring-2 ring-primary"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => editor.chain().focus().setColor(color).run()}
                    />
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium mb-2">Destaque</p>
                <div className="flex gap-1">
                  {HIGHLIGHT_COLORS.map((hl) => (
                    <button
                      key={hl.color}
                      className={cn(
                        "w-6 h-6 rounded border border-border hover:scale-110 transition-transform",
                        editor.isActive("highlight", { color: hl.color }) && "ring-2 ring-primary"
                      )}
                      style={{ backgroundColor: hl.color }}
                      onClick={() => editor.chain().focus().toggleHighlight({ color: hl.color }).run()}
                      title={hl.name}
                    />
                  ))}
                  <button
                    className="w-6 h-6 rounded border border-border hover:bg-muted flex items-center justify-center"
                    onClick={() => editor.chain().focus().unsetHighlight().run()}
                    title="Remover destaque"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Alinhamento */}
        <div className="flex items-center gap-0.5">
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "left" })}
            onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
            aria-label="Alinhar à esquerda"
            className="h-8 w-8 p-0"
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "center" })}
            onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
            aria-label="Centralizar"
            className="h-8 w-8 p-0"
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "right" })}
            onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
            aria-label="Alinhar à direita"
            className="h-8 w-8 p-0"
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "justify" })}
            onPressedChange={() => editor.chain().focus().setTextAlign("justify").run()}
            aria-label="Justificar"
            className="h-8 w-8 p-0"
          >
            <AlignJustify className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Listas */}
        <div className="flex items-center gap-0.5">
          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Lista com marcadores"
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Lista numerada"
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Blocos especiais */}
        <div className="flex items-center gap-0.5">
          <Toggle
            size="sm"
            pressed={editor.isActive("blockquote")}
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
            aria-label="Citação"
            className="h-8 w-8 p-0"
          >
            <Quote className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("codeBlock")}
            onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
            aria-label="Bloco de código"
            className="h-8 w-8 p-0"
          >
            <Code className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={false}
            onPressedChange={() => editor.chain().focus().setHorizontalRule().run()}
            aria-label="Linha horizontal"
            className="h-8 w-8 p-0"
          >
            <Minus className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Link */}
        <Popover>
          <PopoverTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("link")}
              aria-label="Link"
              className="h-8 w-8 p-0"
            >
              <LinkIcon className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Inserir Link</p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://exemplo.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addLink()}
                />
                <Button size="sm" onClick={addLink}>
                  Inserir
                </Button>
              </div>
              {editor.isActive("link") && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => editor.chain().focus().unsetLink().run()}
                >
                  Remover link
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Imagem */}
        <Popover>
          <PopoverTrigger asChild>
            <Toggle size="sm" pressed={false} aria-label="Imagem" className="h-8 w-8 p-0">
              <ImageIcon className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Inserir Imagem</p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addImage()}
                />
                <Button size="sm" onClick={addImage}>
                  Inserir
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Mais opções */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHighlight().run()}>
              <Highlighter className="mr-2 h-4 w-4" />
              Destacar texto
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleCode().run()}>
              <Code className="mr-2 h-4 w-4" />
              Código inline
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
              Limpar formatação
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bubble Menu (aparece ao selecionar texto) */}
      <BubbleMenu 
        editor={editor} 
        className="bg-background border rounded-lg shadow-lg p-1 flex items-center gap-0.5"
      >
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("underline")}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </Toggle>
        <Separator orientation="vertical" className="mx-0.5 h-4" />
        <Toggle
          size="sm"
          pressed={editor.isActive("link")}
          onPressedChange={() => {
            const url = window.prompt("URL do link:")
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("highlight")}
          onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className="h-3.5 w-3.5" />
        </Toggle>
      </BubbleMenu>

      {/* Floating Menu (aparece em linha vazia) */}
      <FloatingMenu 
        editor={editor} 
        className="bg-background border rounded-lg shadow-lg p-1 flex items-center gap-0.5"
      >
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("blockquote")}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("codeBlock")}
          onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="h-3.5 w-3.5" />
        </Toggle>
      </FloatingMenu>

      {/* Área do Editor */}
      <EditorContent editor={editor} className="min-h-[400px]" />

      {/* Barra de Status */}
      <div className="border-t bg-muted/30 px-3 py-1.5 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{editor.storage.characterCount?.characters?.() || 0} caracteres</span>
          <span>{editor.storage.characterCount?.words?.() || 0} palavras</span>
        </div>
        <div className="flex items-center gap-2">
          {editor.isActive("heading", { level: 1 }) && <span>H1</span>}
          {editor.isActive("heading", { level: 2 }) && <span>H2</span>}
          {editor.isActive("heading", { level: 3 }) && <span>H3</span>}
          {editor.isActive("bold") && <span>Negrito</span>}
          {editor.isActive("italic") && <span>Itálico</span>}
        </div>
      </div>
    </div>
  )
}
