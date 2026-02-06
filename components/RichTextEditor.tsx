import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, label }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      (Table as any).configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'p-4 min-h-[150px] outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 prose dark:prose-invert max-w-none focus:ring-0',
      },
    },
  });

  // Sync editor content when value prop changes from outside (e.g. switching questions)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('URL da imagem:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const MenuButton = ({ onClick, isActive, icon, title, label }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${
        isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
      }`}
    >
      {icon ? <i className={`fas fa-${icon}`}></i> : <span className="font-bold">{label}</span>}
    </button>
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 bg-white dark:bg-slate-800">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} label="B" title="Negrito" />
          <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} label="I" title="Itálico" />
          <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} label="U" title="Sublinhado" />
          
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
          
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon="align-left" title="Esquerda" />
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon="align-center" title="Centro" />
          
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
          
          <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon="list-ul" title="Lista" />
          <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon="list-ol" title="Numeração" />
          
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>

          <MenuButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} icon="table" title="Inserir Tabela" />
          <MenuButton onClick={addImage} icon="image" title="Inserir Imagem via URL" />
        </div>
        <EditorContent editor={editor} />
      </div>
      {editor.isActive('table') && (
        <div className="flex gap-2 p-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-[10px] font-bold uppercase tracking-wider overflow-x-auto">
          <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className="hover:text-indigo-600">+ Col Esquerda</button>
          <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="hover:text-indigo-600">+ Col Direita</button>
          <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} className="hover:text-indigo-600">+ Linha Cima</button>
          <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="hover:text-indigo-600">+ Linha Baixo</button>
          <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="text-red-500">Excluir Tabela</button>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;