import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Question, QuestionType, GIFTValidationError } from './types';
import { useQuestionStore } from './hooks/useQuestionStore';
import { useTheme } from './hooks/useTheme';
import { exportToGift, parseGift, downloadFile, validateGift } from './services/giftExporter';
import CategoryTree from './components/CategoryTree';
import QuestionForm from './components/QuestionForm';
import { Icons } from './constants';
import { ConfirmModal, CategoryModal, PreviewModal } from './components/Modals';

const App: React.FC = () => {
  const { 
    registry, store, switchBank, createBank, renameBank, deleteBank,
    addCategory, editCategory, deleteCategory, moveCategory, saveQuestion, duplicateQuestion, deleteQuestion, moveQuestion, bulkImport 
  } = useQuestionStore();
  
  const { theme, toggleTheme } = useTheme();
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showValidationReport, setShowValidationReport] = useState(false);
  const [importText, setImportText] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['root']));
  const [exportContext, setExportContext] = useState<string>('');
  
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const selectedCategory = useMemo(() => 
    store.categories.find(c => c.id === selectedCategoryId),
    [store.categories, selectedCategoryId]
  );

  const filteredQuestions = useMemo(() => 
    store.questions.filter(q => q.categoryId === selectedCategoryId),
    [store.questions, selectedCategoryId]
  );

  const [catModal, setCatModal] = useState({ isOpen: false, mode: 'add' as 'add' | 'edit', parentId: null as string | null, categoryId: null as string | null, name: '' });
  const [bankModal, setBankModal] = useState({ isOpen: false, mode: 'add' as 'add' | 'edit', bankId: null as string | null, name: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmLabel: '', onConfirm: () => {}, isDestructive: false });
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; question: Question | null }>({ isOpen: false, question: null });

  useEffect(() => {
    setSelectedCategoryId(store.categories[0]?.id || null);
    setIsEditingQuestion(false);
    setCurrentQuestion(undefined);
  }, [registry.activeBankId, store.categories.length === 0]);

  const validationResults = useMemo(() => validateGift(importText), [importText]);
  const errorCount = useMemo(() => validationResults.filter(v => v.severity === 'error').length, [validationResults]);
  const warningCount = useMemo(() => validationResults.filter(v => v.severity === 'warning').length, [validationResults]);
  const hasErrors = errorCount > 0;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catModal.name.trim()) return;
    if (catModal.mode === 'add') {
      const newId = addCategory(catModal.name, catModal.parentId);
      if (catModal.parentId) {
        setExpandedIds(prev => new Set([...Array.from(prev), catModal.parentId!]));
      }
    } else if (catModal.categoryId) editCategory(catModal.categoryId, catModal.name);
    setCatModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankModal.name.trim()) return;
    if (bankModal.mode === 'add') createBank(bankModal.name);
    else if (bankModal.bankId) renameBank(bankModal.bankId, bankModal.name);
    setBankModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleImport = () => {
    if (hasErrors) {
      setShowValidationReport(true);
      return;
    }
    const { categories, questions } = parseGift(importText);
    if (categories && questions) {
      bulkImport(categories as any, questions as any);
      setShowImport(false);
      setImportText('');
      setExpandedIds(prev => new Set([...Array.from(prev), 'root']));
    }
  };

  const handleNewQuestion = () => {
    setCurrentQuestion(undefined);
    setIsEditingQuestion(true);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleSelectQuestion = (q: Question) => {
    setSelectedCategoryId(q.categoryId);
    setCurrentQuestion(q);
    setIsEditingQuestion(true);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleToggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(store.categories.map(c => c.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleDuplicateQuestion = (id: string) => {
    duplicateQuestion(id);
  };

  const handleConfirmDeleteQuestion = (id: string) => {
    const q = store.questions.find(x => x.id === id);
    if (q) {
      setConfirmModal({
        isOpen: true,
        title: 'Excluir Questão',
        message: `Deseja excluir "${q.name}"?`,
        confirmLabel: 'Excluir',
        isDestructive: true,
        onConfirm: () => {
          deleteQuestion(id);
          setConfirmModal(p => ({ ...p, isOpen: false }));
        }
      });
    }
  };

  const handlePreviewQuestion = (q: Question) => {
    setPreviewModal({ isOpen: true, question: q });
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/plain' || file.name.endsWith('.gift') || file.name.endsWith('.txt'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImportText(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const renderHighlightedText = () => {
    const lines = importText.split('\n');
    return lines.map((line, idx) => {
      const lineNum = idx + 1;
      const issues = validationResults.filter(v => v.line === lineNum);
      const isError = issues.some(v => v.severity === 'error');
      const isWarning = issues.some(v => v.severity === 'warning');
      
      let className = "relative inline-block w-full min-h-[1.2rem]";
      if (isError) className += " bg-red-500/10 border-b-2 border-red-500 border-dotted";
      else if (isWarning) className += " bg-amber-500/10 border-b-2 border-amber-500 border-dotted";

      return (
        <div key={idx} className={className}>
          <span className="opacity-0">{line || ' '}</span>
        </div>
      );
    });
  };

  const handleSidebarDragOver = (e: React.DragEvent) => {
    if (!sidebarScrollRef.current) return;
    const { top, bottom } = sidebarScrollRef.current.getBoundingClientRect();
    const threshold = 60;
    const scrollSpeed = 8;
    if (e.clientY < top + threshold) sidebarScrollRef.current.scrollTop -= scrollSpeed;
    else if (e.clientY > bottom - threshold) sidebarScrollRef.current.scrollTop += scrollSpeed;
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 sm:w-80 border-r transition-all duration-300 transform lg:static lg:translate-x-0
        ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className={`p-6 border-b flex items-center justify-between ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
            <h1 className="font-black text-xl text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <Icons.Layers />
              <span>GIFT BANK</span>
            </h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 transition">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div ref={sidebarScrollRef} onDragOver={handleSidebarDragOver} className="flex-1 overflow-y-auto p-4 scrollbar-thin space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meus Bancos</h2>
                <button onClick={() => setBankModal({ isOpen: true, mode: 'add', bankId: null, name: '' })} className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline">+ Novo</button>
              </div>
              <div className="space-y-1">
                {registry.banks.map(bank => (
                  <div key={bank.id} onClick={() => switchBank(bank.id)} className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all ${registry.activeBankId === bank.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <Icons.Bank />
                      <span className="truncate text-sm font-bold tracking-tight">{bank.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); setBankModal({ isOpen: true, mode: 'edit', bankId: bank.id, name: bank.name }); }} className={`p-1 rounded ${registry.activeBankId === bank.id ? 'hover:bg-white/20' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}><Icons.Edit /></button>
                      {registry.banks.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, title: 'Excluir Banco', message: `Deseja apagar "${bank.name}" e todas as suas questões?`, confirmLabel: 'Excluir', isDestructive: true, onConfirm: () => { deleteBank(bank.id); setConfirmModal(p => ({...p, isOpen: false})); }}); }} className={`p-1 rounded ${registry.activeBankId === bank.id ? 'hover:bg-white/20' : 'hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-red-500'}`}><Icons.Trash /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estrutura</h2>
                <div className="flex items-center gap-1">
                   <button onClick={expandAll} className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors" title="Expandir Tudo"><Icons.ExpandAll /></button>
                   <button onClick={collapseAll} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors" title="Recolher Tudo"><Icons.CollapseAll /></button>
                   <div className="w-px h-3 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                   <button onClick={() => setCatModal({ isOpen: true, mode: 'add', parentId: null, categoryId: null, name: '' })} className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded flex items-center gap-1 transition-colors" title="Nova Categoria Raiz">
                     <Icons.Plus /> <span className="text-[9px] font-black uppercase">Root</span>
                   </button>
                </div>
              </div>
              <CategoryTree 
                categories={store.categories} 
                questions={store.questions}
                selectedCategoryId={selectedCategoryId} 
                expandedIds={expandedIds}
                onToggleExpand={handleToggleExpand}
                onSelectCategory={(id) => { setSelectedCategoryId(id); setIsEditingQuestion(false); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                onSelectQuestion={handleSelectQuestion}
                onDuplicateQuestion={handleDuplicateQuestion}
                onDeleteQuestion={handleConfirmDeleteQuestion}
                onPreviewQuestion={handlePreviewQuestion}
                onAddSubcategory={(parentId) => setCatModal({ isOpen: true, mode: 'add', parentId, categoryId: null, name: '' })}
                onEditCategory={(id) => { const c = store.categories.find(x => x.id === id); if (c) setCatModal({ isOpen: true, mode: 'edit', parentId: c.parentId, categoryId: id, name: c.name }); }}
                onDeleteCategory={(id) => setConfirmModal({ isOpen: true, title: 'Excluir Categoria', message: 'Deseja excluir esta categoria e tudo que houver nela?', confirmLabel: 'Excluir', isDestructive: true, onConfirm: () => { deleteCategory(id); if (selectedCategoryId === id) setSelectedCategoryId(null); setConfirmModal(p => ({...p, isOpen: false})); }})}
                onMoveCategory={moveCategory} 
                onMoveQuestion={moveQuestion}
              />
            </div>
          </div>

          <div className={`p-6 border-t flex flex-col gap-2 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
            <div className="space-y-1 mb-2 px-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                <i className="fas fa-cog"></i> Contexto do Moodle
              </label>
              <select 
                value={exportContext} 
                onChange={(e) => setExportContext(e.target.value)}
                className={`w-full p-2 rounded-lg text-xs font-bold outline-none border transition ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                <option value="">Nenhum (Relativo)</option>
                <option value="$course$">$course$ (Curso)</option>
                <option value="$module$">$module$ (Atividade)</option>
                <option value="$system$">$system$ (Sistema)</option>
              </select>
            </div>
            
            <button onClick={() => setShowImport(true)} className={`w-full py-3 rounded-xl font-bold text-sm transition ${theme === 'dark' ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}>
              <i className="fas fa-file-import mr-2"></i>Importar GIFT
            </button>
            <button onClick={() => downloadFile(exportToGift(store.categories, store.questions, selectedCategoryId || undefined, exportContext), `${selectedCategory?.name || 'banco'}.gift.txt`)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg transition flex items-center justify-center gap-2">
              <Icons.Download /> {selectedCategoryId === null || selectedCategoryId === 'root' ? 'Exportar Banco' : 'Exportar Categoria'}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className={`px-4 sm:px-8 py-4 border-b flex items-center justify-between z-20 backdrop-blur-md sticky top-0 ${theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 lg:hidden text-slate-500"><i className="fas fa-bars"></i></button>
            <div className="min-w-0">
              <nav className="hidden sm:flex text-[10px] font-bold text-slate-400 uppercase gap-2 mb-0.5">
                <span>{registry.banks.find(b => b.id === registry.activeBankId)?.name || 'Repositório'}</span>
                <span>/</span>
                <span className="truncate text-indigo-500">{selectedCategory?.name || 'Início'}</span>
              </nav>
              <h2 className="text-xl font-black truncate uppercase tracking-tight">{selectedCategory?.name || 'Explorador'}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={`p-2.5 rounded-xl transition ${theme === 'dark' ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i></button>
            <button onClick={handleNewQuestion} disabled={!selectedCategoryId} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2">
              <Icons.Plus /> <span className="hidden sm:inline">Nova Questão</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-thin">
          {isEditingQuestion ? (
            <div className="max-w-5xl mx-auto">
              <button onClick={() => setIsEditingQuestion(false)} className="mb-6 text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest">
                <Icons.ArrowLeft /> Cancelar e Voltar
              </button>
              <QuestionForm 
                key={currentQuestion?.id || 'new'}
                categoryId={selectedCategoryId!} categories={store.categories} initialData={currentQuestion} 
                onCancel={() => setIsEditingQuestion(false)} onSubmit={(d) => { saveQuestion(d, currentQuestion?.id); setIsEditingQuestion(false); }} 
              />
            </div>
          ) : (
            <div className="max-w-6xl mx-auto pb-12">
              <div className="mb-8 flex items-center justify-between">
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                   {selectedCategory?.name || 'Selecione uma categoria'} 
                   <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-lg text-[10px]">{filteredQuestions.length} questões</span>
                 </h3>
              </div>
              
              {filteredQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center opacity-80">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${theme === 'dark' ? 'bg-slate-900 text-slate-700' : 'bg-slate-100 text-slate-300'}`}><i className="fas fa-ghost text-4xl"></i></div>
                  <h3 className="text-xl font-bold">Categoria vazia</h3>
                  <p className="text-slate-500 mt-2">Nenhuma questão encontrada para esta categoria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredQuestions.map(q => (
                    <div 
                      key={q.id} 
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData('application/json', JSON.stringify({ type: 'question', id: q.id })); e.dataTransfer.effectAllowed = 'move'; }}
                      onClick={() => handleSelectQuestion(q)}
                      className={`p-6 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/50' : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 hover:bg-slate-50'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${q.type === QuestionType.MULTIPLE_CHOICE ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {q.type === QuestionType.MULTIPLE_CHOICE ? 'Múltipla' : 'Dissertativa'}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{q.name}</h3>
                        <div className={`text-sm line-clamp-1 mt-1 font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} dangerouslySetInnerHTML={{ __html: q.content }} />
                      </div>
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleDuplicateQuestion(q.id); }} className="p-3 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl" title="Duplicar"><Icons.Copy /></button>
                        <button onClick={(e) => { e.stopPropagation(); handlePreviewQuestion(q); }} className="p-3 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl" title="Simular Moodle"><Icons.Search /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleSelectQuestion(q); }} className="p-3 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl"><Icons.Edit /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleConfirmDeleteQuestion(q.id); }} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"><Icons.Trash /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <CategoryModal isOpen={catModal.isOpen} mode={catModal.mode} name={catModal.name} setName={(n) => setCatModal(p => ({...p, name: n}))} onSubmit={handleCategorySubmit} onClose={() => setCatModal(p => ({...p, isOpen: false}))} />
      <ConfirmModal {...confirmModal} onClose={() => setConfirmModal(p => ({...p, isOpen: false}))} />
      <PreviewModal isOpen={previewModal.isOpen} question={previewModal.question} onClose={() => setPreviewModal({ isOpen: false, question: null })} />

      {bankModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-6 animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{bankModal.mode === 'add' ? 'Novo Banco' : 'Renomear Banco'}</h2>
            <form onSubmit={handleBankSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Nome do Banco</label>
                <input autoFocus value={bankModal.name} onChange={(e) => setBankModal(p => ({...p, name: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 outline-none text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all" required />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setBankModal(p => ({...p, isOpen: false}))} className="px-6 py-3 font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">Cancelar</button>
                <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none">{bankModal.mode === 'add' ? 'Criar' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showImport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className={`rounded-3xl w-full max-w-4xl shadow-2xl border p-8 space-y-4 animate-in zoom-in duration-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase tracking-tight">Importar GIFT</h2>
              <span className="text-[10px] font-black uppercase text-slate-400">Arraste um arquivo .txt para carregar</span>
            </div>
            
            <div onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }} onDragLeave={() => setIsDraggingFile(false)} onDrop={handleFileDrop} className={`relative group transition-all duration-300 rounded-2xl overflow-hidden border-2 border-dashed h-[450px] ${isDraggingFile ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800'}`}>
              <div ref={highlightRef} className="absolute inset-0 p-6 font-mono text-xs whitespace-pre overflow-hidden pointer-events-none">{renderHighlightedText()}</div>
              <textarea ref={textareaRef} onScroll={handleScroll} className={`absolute inset-0 w-full h-full p-6 font-mono text-xs focus:ring-0 outline-none bg-transparent resize-none leading-[1.2rem] ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`} placeholder="$CATEGORY: top/..." value={importText} onChange={(e) => { setImportText(e.target.value); handleScroll(); }} />
              {isDraggingFile && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-indigo-600/10 backdrop-blur-sm">
                  <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-xl shadow-xl font-black text-indigo-600 flex items-center gap-2"><i className="fas fa-file-upload text-xl"></i> Solte o arquivo para importar</div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                {validationResults.length > 0 && (
                  <button onClick={() => setShowValidationReport(true)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-black text-[10px] transition-all transform hover:scale-105 uppercase tracking-widest ${hasErrors ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'}`}>
                    <i className={`fas fa-${hasErrors ? 'times-circle' : 'exclamation-triangle'}`}></i>
                    <span>{errorCount} Erros e {warningCount} Avisos. Clique para detalhes.</span>
                  </button>
                )}
              </div>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => setShowImport(false)} className={`px-6 py-3 font-bold rounded-xl transition ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>Cancelar</button>
                <button disabled={hasErrors} onClick={handleImport} className={`px-8 py-3 font-black rounded-xl transition active:scale-95 flex items-center gap-2 ${hasErrors ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none'}`}>
                  {hasErrors ? <i className="fas fa-lock"></i> : <i className="fas fa-check"></i>} Importar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showValidationReport && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`rounded-3xl w-full max-w-2xl shadow-2xl border p-8 flex flex-col max-h-[80vh] ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tight"><i className="fas fa-clipboard-list text-indigo-500"></i> Relatório de Erros</h2>
              <button onClick={() => setShowValidationReport(false)} className="text-slate-400 hover:text-slate-600 p-2"><i className="fas fa-times text-xl"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {validationResults.map((v, i) => (
                <div key={i} className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${v.severity === 'error' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30'}`}>
                  <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${v.severity === 'error' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>{v.severity === 'error' ? 'ERRO' : 'AVIS'}</div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${v.severity === 'error' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>Linha {v.line}</span>
                    <p className="font-bold text-sm mt-1">{v.message}</p>
                    <code className="block mt-2 p-2 bg-black/5 dark:bg-white/5 rounded-lg text-[10px] truncate italic">"{v.text}"</code>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{hasErrors ? "❌ Corrija os erros para prosseguir." : "✅ Pronto para importar."}</p>
              <button onClick={() => setShowValidationReport(false)} className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition">Voltar ao Editor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;