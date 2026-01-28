"use client"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '@/components/ui/button'
import { Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react'

const Tiptap = ({ content, onChange }: { content: string, onChange: (html: string) => void }) => {
  const editor = useEditor({
    extensions: [StarterKit], 
    content: content,
    onUpdate: ({ editor }) => {
        onChange(editor.getHTML())
    },
    editorProps: {
        attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 max-w-none'
        }
    }
  })

  if (!editor) {
    return null
  }

  return (
    <div className="space-y-0 rounded-md border min-h-[400px] flex flex-col bg-card">
       <div className="flex items-center gap-1 border-b p-2 bg-muted/20">
           <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-muted' : ''}>
              <Bold className="w-4 h-4"/>
           </Button>
           <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-muted' : ''}>
              <Italic className="w-4 h-4"/>
           </Button>
           <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}>
              <Heading2 className="w-4 h-4"/>
           </Button>
           <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-muted' : ''}>
              <List className="w-4 h-4"/>
           </Button>
       </div>
       <div className="flex-1 overflow-auto">
          <EditorContent editor={editor} className="h-full" />
       </div>
    </div>
  )
}

export default Tiptap
