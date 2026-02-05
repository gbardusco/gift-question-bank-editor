
import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, label }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 bg-white dark:bg-slate-800">
        <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          <button type="button" onClick={() => execCommand('bold')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 font-bold" title="Bold">B</button>
          <button type="button" onClick={() => execCommand('italic')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 italic" title="Italic">I</button>
          <button type="button" onClick={() => execCommand('underline')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 underline" title="Underline">U</button>
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
          <button type="button" onClick={() => execCommand('justifyLeft')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300" title="Align Left"><i className="fas fa-align-left"></i></button>
          <button type="button" onClick={() => execCommand('justifyCenter')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300" title="Align Center"><i className="fas fa-align-center"></i></button>
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
          <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300" title="Bullet List"><i className="fas fa-list-ul"></i></button>
          <button type="button" onClick={() => execCommand('insertOrderedList')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300" title="Numbered List"><i className="fas fa-list-ol"></i></button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="p-4 min-h-[150px] outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
