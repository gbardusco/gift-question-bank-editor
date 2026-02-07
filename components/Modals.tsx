import React, { useEffect, useRef, useState } from 'react';
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

export const LaTeXModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (latex: string) => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  const [latex, setLatex] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && previewRef.current && (window as any).katex) {
      try {
        (window as any).katex.render(latex || '\\text{Aguardando fórmula...}', previewRef.current, {
          throwOnError: false,
          displayMode: true
        });
      } catch (e) {
        console.error("KaTeX error", e);
      }
    }
  }, [latex, isOpen]);

  const insertSnippet = (snippet: string) => {
    setLatex(prev => prev + snippet);
  };

  const snippets = [
    { label: 'Fração', code: '\\frac{x}{y}', icon: '÷' },
    { label: 'Raiz', code: '\\sqrt{x}', icon: '√' },
    { label: 'Potência', code: 'x^{y}', icon: 'xⁿ' },
    { label: 'Soma', code: '\\sum_{i=1}^{n}', icon: 'Σ' },
    { label: 'Integral', code: '\\int_{a}^{b}', icon: '∫' },
    { label: 'Vetor', code: '\\vec{v}', icon: '→' },
    { label: 'Infinito', code: '\\infty', icon: '∞' },
    { label: 'Grego', code: '\\alpha \\beta \\gamma', icon: 'αβ' },
  ];

  const handleConfirm = () => {
    if (latex.trim()) onConfirm(latex.trim());
    setLatex('');
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase tracking-tight">
          <Icons.Sigma /> Assistente de LaTeX
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 transition-colors">
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {snippets.map((s, i) => (
            <button 
              key={i} 
              type="button"
              onClick={() => insertSnippet(s.code)}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
            >
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{s.icon}</span>
              <span className="text-[9px] font-black uppercase text-slate-400 mt-1">{s.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Código LaTeX</label>
          <textarea 
            autoFocus
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            placeholder="Digite o código aqui (ex: E = mc^2)"
            className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Visualização (Preview)</label>
          <div className="w-full min-h-[100px] flex items-center justify-center p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-x-auto">
            <div ref={previewRef} className="text-2xl text-slate-800 dark:text-slate-100" />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button onClick={onClose} className="px-6 py-3 font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">Cancelar</button>
          <button onClick={handleConfirm} className="px-10 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition shadow-lg">Inserir no Editor</button>
        </div>
      </div>
    </BaseModal>
  );
};

export const PreviewModal: React.FC<{
  isOpen: boolean; 
  question: Question | null; 
  onClose: () => void;
}> = ({ isOpen, question, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [essayContent, setEssayContent] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  useEffect(() => {
    setSelectedChoiceId(null);
    setEssayContent('');
    setIsSubmitted(false);
  }, [isOpen, question?.id]);

  if (!question) return null;

  const handleCheck = () => {
    if (question.type === QuestionType.MULTIPLE_CHOICE && !selectedChoiceId) return;
    if (question.type === QuestionType.ESSAY && !essayContent.trim()) return;
    setIsSubmitted(true);
  };

  const isCorrect = question.type === QuestionType.MULTIPLE_CHOICE 
    ? question.choices.find(c => c.id === selectedChoiceId)?.isCorrect 
    : true;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase tracking-tight">
          <Icons.Search /> Simulador Moodle
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 transition-colors">
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-6" ref={contentRef}>
        <div className="flex flex-col lg:flex-row gap-0 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-slate-900">
          <div className="w-full lg:w-48 bg-slate-100 dark:bg-slate-800 p-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700 space-y-3 shrink-0">
            <div>
              <p className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Questão 1</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-1">
                {isSubmitted ? 'Finalizada' : 'Ainda não respondida'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Vale 1,00 ponto(s)</p>
            </div>
            {isSubmitted && question.type === QuestionType.MULTIPLE_CHOICE && (
              <div className={`text-[10px] font-black uppercase px-2 py-1 rounded ${isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {isCorrect ? 'Nota 1,00' : 'Nota 0,00'}
              </div>
            )}
            <button className="text-[10px] font-bold uppercase flex items-center gap-1 text-slate-400 hover:text-indigo-500 transition-colors pt-2">
              <i className="fas fa-flag"></i> Marcar questão
            </button>
          </div>

          <div className="flex-1 bg-[#f8f9fa] dark:bg-slate-900/40 p-6 lg:p-8 space-y-8">
            <div 
              className="text-slate-800 dark:text-slate-200 prose dark:prose-invert max-w-none text-base"
              dangerouslySetInnerHTML={{ __html: question.content }} 
            />

            <div className="space-y-5">
              {question.type === QuestionType.MULTIPLE_CHOICE ? (
                <>
                  <p className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Escolha uma opção:</p>
                  <div className="space-y-3 pl-1">
                    {question.choices.map((choice, idx) => {
                      const isThisSelected = selectedChoiceId === choice.id;
                      let choiceClasses = "flex items-start gap-4 p-3 rounded-xl transition-all border border-transparent ";
                      
                      if (isSubmitted) {
                        if (isThisSelected) {
                          choiceClasses += isCorrect ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800";
                        } else if (choice.isCorrect) {
                          choiceClasses += "bg-emerald-50/30 dark:bg-emerald-900/5 border-dashed border-emerald-200/50 dark:border-emerald-800/50";
                        }
                      } else {
                        choiceClasses += "hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer";
                      }

                      return (
                        <div 
                          key={choice.id} 
                          className={choiceClasses}
                          onClick={() => !isSubmitted && setSelectedChoiceId(choice.id)}
                        >
                          <div className="flex items-center h-5 mt-0.5">
                            <input 
                              type="radio" 
                              name="preview-choice" 
                              checked={isThisSelected}
                              disabled={isSubmitted}
                              onChange={() => setSelectedChoiceId(choice.id)}
                              className="w-4 h-4 border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                            />
                          </div>
                          <div className="flex items-baseline gap-3 flex-1 min-w-0">
                            <span className="text-xs font-black text-slate-400 font-mono mt-0.5">{String.fromCharCode(97 + idx)}.</span>
                            <div 
                              className="text-sm text-slate-700 dark:text-slate-300 flex-1 break-words"
                              dangerouslySetInnerHTML={{ __html: choice.text }}
                            />
                            {isSubmitted && isThisSelected && (
                              <span className={`text-lg ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                                <i className={`fas fa-${isCorrect ? 'check-circle' : 'times-circle'}`}></i>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Sua resposta:</p>
                  <textarea 
                    value={essayContent}
                    onChange={(e) => setEssayContent(e.target.value)}
                    disabled={isSubmitted}
                    className="w-full h-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm shadow-inner"
                    placeholder="Digite sua resposta aqui..."
                  />
                </div>
              )}
            </div>
            
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {!isSubmitted ? (
                  <button 
                    onClick={() => setSelectedChoiceId(null)}
                    className="text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-30"
                    disabled={!selectedChoiceId && !essayContent}
                  >
                    Limpar minha escolha
                  </button>
                ) : (
                  <button 
                    onClick={() => { setIsSubmitted(false); setSelectedChoiceId(null); setEssayContent(''); }}
                    className="text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Tentar Novamente
                  </button>
                )}
              </div>

              {!isSubmitted && (
                <button 
                  onClick={handleCheck}
                  disabled={question.type === QuestionType.MULTIPLE_CHOICE ? !selectedChoiceId : !essayContent.trim()}
                  className="w-full sm:w-auto px-10 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/10 active:scale-95 disabled:opacity-50"
                >
                  Verificar
                </button>
              )}
            </div>

            {isSubmitted && (
              <div className={`p-5 rounded-xl border animate-in slide-in-from-top-2 duration-300 ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'}`}>
                <p className={`font-black text-sm uppercase tracking-tight flex items-center gap-2 ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                   {isCorrect ? <><i className="fas fa-check"></i> Sua resposta está correta.</> : <><i className="fas fa-times"></i> Sua resposta está incorreta.</>}
                </p>
                {question.type === QuestionType.MULTIPLE_CHOICE && !isCorrect && (
                  <p className="text-xs mt-2 font-bold text-slate-600 dark:text-slate-400">
                    A resposta correta é: {
                      (() => {
                        const correct = question.choices.find(c => c.isCorrect);
                        if (!correct) return "Não definida";
                        const div = document.createElement('div');
                        div.innerHTML = correct.text;
                        return div.textContent || div.innerText || "Verifique o conteúdo";
                      })()
                    }
                  </p>
                )}
                {question.type === QuestionType.ESSAY && (
                  <p className="text-xs mt-2 font-bold text-slate-600 dark:text-slate-400">
                    Respostas dissertativas precisam ser avaliadas manualmente por um professor no Moodle real.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={onClose}
          className="px-10 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition"
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
        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{message}</p>
      </div>
      <div className="flex flex-col gap-2 pt-4">
        <button onClick={onConfirm} className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 ${isDestructive ? 'bg-red-600 hover:bg-red-700 shadow-red-500/10' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/10'}`}>
          {confirmLabel}
        </button>
        <button onClick={onClose} className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
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
      <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
        {mode === 'add' ? 'Nova Categoria' : 'Editar Categoria'}
      </h2>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2"><i className="fas fa-times text-xl"></i></button>
    </div>
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nome da Categoria</label>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 outline-none text-slate-900 dark:text-slate-100 text-lg font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" required />
      </div>
      <div className="flex gap-3 justify-end pt-4">
        <button type="button" onClick={onClose} className="px-6 py-3 font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">Cancelar</button>
        <button type="submit" className="px-10 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none">
          {mode === 'add' ? 'Criar' : 'Salvar'}
        </button>
      </div>
    </form>
  </BaseModal>
);