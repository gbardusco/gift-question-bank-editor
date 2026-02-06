import React, { useEffect, useRef } from 'react';
import { Icons } from '../constants';
import { Question, QuestionType } from '../types';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

const BaseModal: React.FC<BaseModalProps> = ({ isOpen, onClose, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`bg-white dark:bg-slate-900 rounded-3xl w-full ${maxWidth} shadow-2xl border border-slate-200 dark:border-slate-800 p-8 overflow-hidden flex flex-col max-h-[90vh]`}>
        {children}
      </div>
    </div>
  );
};

export const PreviewModal: React.FC<{
  isOpen: boolean; 
  question: Question | null; 
  onClose: () => void;
}> = ({ isOpen, question, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentRef.current && (window as any).renderMathInElement) {
      (window as any).renderMathInElement(contentRef.current, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false},
          {left: '\\(', right: '\\)', display: false},
          {left: '\\[', right: '\\]', display: true}
        ],
        throwOnError: false
      });
    }
  }, [isOpen, question]);

  if (!question) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Icons.Search /> Simulador Moodle
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2"><i className="fas fa-times text-xl"></i></button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-6" ref={contentRef}>
        {/* Moodle Style Question Layout */}
        <div className="flex flex-col lg:flex-row gap-0 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
          {/* Question Meta Sidebar (Moodle Style) */}
          <div className="w-full lg:w-48 bg-slate-100 dark:bg-slate-800 p-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700 space-y-3">
            <div>
              <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-tight">Questão 1</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Ainda não respondida</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Vale 1,00 ponto(s)</p>
            </div>
            <button className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-indigo-500 transition-colors">
              <i className="fas fa-flag"></i> Marcar questão
            </button>
          </div>

          {/* Question Content Area */}
          <div className="flex-1 bg-[#f8f9fa] dark:bg-slate-900 p-6 lg:p-8 space-y-6">
            <div 
              className="text-slate-800 dark:text-slate-200 prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: question.content }} 
            />

            <div className="space-y-4">
              {question.type === QuestionType.MULTIPLE_CHOICE ? (
                <>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Escolha uma opção:</p>
                  <div className="space-y-3 pl-2">
                    {question.choices.map((choice, idx) => (
                      <div key={choice.id} className="flex items-start gap-3 group">
                        <div className="flex items-center h-5">
                          <input 
                            type="radio" 
                            name="preview-choice" 
                            className="w-4 h-4 border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500" 
                          />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-slate-500 font-mono">{String.fromCharCode(97 + idx)}.</span>
                          <div 
                            className="text-sm text-slate-700 dark:text-slate-300"
                            dangerouslySetInnerHTML={{ __html: choice.text }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Sua resposta:</p>
                  <textarea 
                    className="w-full h-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Digite sua resposta aqui..."
                  />
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline">Limpar minha escolha</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={onClose}
          className="px-8 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition"
        >
          Fechar Simulador
        </button>
      </div>
    </BaseModal>
  );
};

export const ConfirmModal: React.FC<{
  isOpen: boolean; title: string; message: string; confirmLabel: string; onConfirm: () => void; onClose: () => void; isDestructive?: boolean;
}> = ({ isOpen, title, message, confirmLabel, onConfirm, onClose, isDestructive }) => (
  <BaseModal isOpen={isOpen} onClose={onClose}>
    <div className="text-center space-y-6">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${isDestructive ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500'}`}>
        <i className={`fas fa-${isDestructive ? 'exclamation-triangle' : 'question-circle'} text-2xl`}></i>
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400">{message}</p>
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={onConfirm} className={`w-full py-3 rounded-xl font-black text-white shadow-lg transition-all active:scale-95 ${isDestructive ? 'bg-red-600 hover:bg-red-700 shadow-red-500/10' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/10'}`}>
          {confirmLabel}
        </button>
        <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          Cancelar
        </button>
      </div>
    </div>
  </BaseModal>
);

export const CategoryModal: React.FC<{
  isOpen: boolean; mode: 'add' | 'edit'; name: string; setName: (name: string) => void; onSubmit: (e: React.FormEvent) => void; onClose: () => void;
}> = ({ isOpen, mode, name, setName, onSubmit, onClose }) => (
  <BaseModal isOpen={isOpen} onClose={onClose}>
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
        {mode === 'add' ? 'Nova Categoria' : 'Editar Categoria'}
      </h2>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2"><i className="fas fa-times text-xl"></i></button>
    </div>
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Nome da Categoria</label>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 outline-none text-slate-900 dark:text-slate-100 text-lg focus:ring-2 focus:ring-indigo-500 transition-all" required />
      </div>
      <div className="flex gap-3 justify-end pt-4">
        <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">Cancelar</button>
        <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none">
          {mode === 'add' ? 'Criar' : 'Salvar'}
        </button>
      </div>
    </form>
  </BaseModal>
);