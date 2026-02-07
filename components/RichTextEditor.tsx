import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { Icons } from '../constants';
import { LaTeXModal } from './Modals';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, label }) => {
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        allowBase64: true,
      }),
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

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('URL da imagem:');
    if (url && url.trim()) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleInsertLaTeX = (latex: string) => {
    // Standard Moodle-compatible LaTeX delimiters
    const content = ` $$ ${latex} $$ `;
    editor.chain().focus().insertContent(content).run();
  };

  const MenuButton = ({ onClick, isActive, icon, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors flex items-center justify-center min-w-[32px] ${
        isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
      }`}
    >
      {icon()}
    </button>
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">{label}</label>
      <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 bg-white dark:bg-slate-800 transition-all shadow-sm">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <MenuButton 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            isActive={editor.isActive('bold')} 
            icon={() => <i className="fas fa-bold text-xs"></i>} 
            title="Negrito" 
          />
          <MenuButton 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            isActive={editor.isActive('italic')} 
            icon={() => <i className="fas fa-italic text-xs"></i>} 
            title="Itálico" 
          />
          <MenuButton 
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            isActive={editor.isActive('underline')} 
            icon={() => <i className="fas fa-underline text-xs"></i>} 
            title="Sublinhado" 
          />
          
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
          
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={() => <i className="fas fa-align-left text-xs"></i>} title="Esquerda" />
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={() => <i className="fas fa-align-center text-xs"></i>} title="Centro" />
          
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
          
          <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={() => <i className="fas fa-list-ul text-xs"></i>} title="Lista" />
          <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={() => <i className="fas fa-list-ol text-xs"></i>} title="Numeração" />
          
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>

          <MenuButton onClick={() => setIsMathModalOpen(true)} icon={Icons.Sigma} title="Assistente de Fórmulas (LaTeX)" />
          <MenuButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} icon={() => <i className="fas fa-table text-xs"></i>} title="Inserir Tabela" />
          <MenuButton onClick={addImage} icon={() => <i className="fas fa-image text-xs"></i>} title="Inserir Imagem via URL" />
        </div>
        <EditorContent editor={editor} />
      </div>
      
      {editor.isActive('table') && (
        <div className="flex gap-4 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest overflow-x-auto border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-1">
          <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className="hover:text-indigo-600 transition-colors">+ Col Esq</button>
          <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="hover:text-indigo-600 transition-colors">+ Col Dir</button>
          <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} className="hover:text-indigo-600 transition-colors">+ Linha Cima</button>
          <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="hover:text-indigo-600 transition-colors">+ Linha Baixo</button>
          <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="text-red-500 hover:text-red-600 transition-colors">Excluir Tabela</button>
        </div>
      )}

      <LaTeXModal 
        isOpen={isMathModalOpen} 
        onClose={() => setIsMathModalOpen(false)} 
        onConfirm={handleInsertLaTeX} 
      />
    </div>
  );
};

export default RichTextEditor;