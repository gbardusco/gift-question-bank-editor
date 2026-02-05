
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Question, QuestionType } from './types';
import { useQuestionStore } from './hooks/useQuestionStore';
import { useTheme } from './hooks/useTheme';
import { exportToGift, parseGift, downloadFile } from './services/giftExporter';
import CategoryTree from './components/CategoryTree';
import QuestionForm from './components/QuestionForm';
import { Icons } from './constants';
import { ConfirmModal, CategoryModal, PreviewModal } from './components/Modals';

const App: React.FC = () => {
  const { 
    registry, store, switchBank, createBank, renameBank, deleteBank,
    addCategory, editCategory, deleteCategory, moveCategory, saveQuestion, deleteQuestion, moveQuestion, bulkImport 
  } = useQuestionStore();
  
  const { theme, toggleTheme } = useTheme();
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  
  const sidebarScrollRef = useRef<HTMLDivElement>(null);

  // Modals States
  const [catModal, setCatModal] = useState({ isOpen: false, mode: 'add' as 'add' | 'edit', parentId: null as string | null, categoryId: null as string | null, name: '' });
  const [bankModal, setBankModal] = useState({ isOpen: false, mode: 'add' as 'add' | 'edit', bankId: null as string | null, name: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmLabel: '', onConfirm: () => {}, isDestructive: false });
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; question: Question | null }>({ isOpen: false, question: null });

  // Reset category selection when switching banks
  useEffect(() => {
    setSelectedCategoryId(store.categories[0]?.id || 'root');
    setIsEditingQuestion(false);
    setCurrentQuestion(undefined);
  }, [registry.activeBankId, store.categories]);

  const selectedCategory = useMemo(() => store.categories.find(c => c.id === selectedCategoryId), [selectedCategoryId, store.categories]);
  const filteredQuestions = useMemo(() => store.questions.filter(q => q.categoryId === selectedCategoryId), [selectedCategoryId, store.questions]);

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
    if (catModal.mode === 'add') addCategory(catModal.name, catModal.parentId);
    else if (catModal.categoryId) editCategory(catModal.categoryId, catModal.name);
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
    const { categories, questions } = parseGift(importText);
    if (categories && questions) {
      bulkImport(categories as any, questions as any);
      setShowImport(false);
      setImportText('');
    }
  };

  const handleSelectQuestion = (q: Question) => {
    setSelectedCategoryId(q.categoryId);
    setCurrentQuestion(q);
    setIsEditingQuestion(true);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handlePreviewQuestion = (q: Question) => {
    setPreviewModal({ isOpen: true, question: q });
  };

  const handleSidebarDragOver = (e: React.DragEvent) => {
    if (!sidebarScrollRef.current) return;
    const { top, bottom } = sidebarScrollRef.current.getBoundingClientRect();
    const threshold = 60;
    const scrollSpeed = 8;
    
    if (e.clientY < top + threshold) {
      sidebarScrollRef.current.scrollTop -= scrollSpeed;
    } else if (e.clientY > bottom - threshold) {
      sidebarScrollRef.current.scrollTop += scrollSpeed;
    }
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
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
          
          <div 
            ref={sidebarScrollRef}
            onDragOver={handleSidebarDragOver}
            className="flex-1 overflow-y-auto p-4 scrollbar-thin space-y-8"
          >
            {/* Banks Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meus Bancos</h2>
                <button onClick={() => setBankModal({ isOpen: true, mode: 'add', bankId: null, name: '' })} className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline">+ Novo</button>
              </div>
              <div className="space-y-1">
                {registry.banks.map(bank => (
                  <div 
                    key={bank.id}
                    onClick={() => switchBank(bank.id)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all ${
                      registry.activeBankId === bank.id 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icons.Bank />
                      <span className="truncate text-sm font-bold tracking-tight">{bank.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setBankModal({ isOpen: true, mode: 'edit', bankId: bank.id, name: bank.name }); }}
                        className={`p-1 rounded ${registry.activeBankId === bank.id ? 'hover:bg-white/20' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                      >
                        <Icons.Edit />
                      </button>
                      {registry.banks.length > 1 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setConfirmModal({ 
                            isOpen: true, title: 'Excluir Banco', message: `Deseja apagar "${bank.name}" e todas as suas questões?`, confirmLabel: 'Excluir', isDestructive: true, 
                            onConfirm: () => { deleteBank(bank.id); setConfirmModal(p => ({...p, isOpen: false})); }
                          }); }}
                          className={`p-1 rounded ${registry.activeBankId === bank.id ? 'hover:bg-white/20' : 'hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-red-500'}`}
                        >
                          <Icons.Trash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Structure Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estrutura</h2>
                <button onClick={() => setCatModal({ isOpen: true, mode: 'add', parentId: null, categoryId: null, name: '' })} className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline">+ Root</button>
              </div>
              <CategoryTree 
                categories={store.categories} 
                questions={store.questions}
                selectedCategoryId={selectedCategoryId} 
                onSelectCategory={(id) => { setSelectedCategoryId(id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                onSelectQuestion={handleSelectQuestion}
                onPreviewQuestion={handlePreviewQuestion}
                onAddSubcategory={(parentId) => setCatModal({ isOpen: true, mode: 'add', parentId, categoryId: null, name: '' })}
                onEditCategory={(id) => { 
                  const c = store.categories.find(x => x.id === id); 
                  if (c) setCatModal({ isOpen: true, mode: 'edit', parentId: c.parentId, categoryId: id, name: c.name }); 
                }}
                onDeleteCategory={(id) => setConfirmModal({ 
                  isOpen: true, title: 'Excluir Categoria', message: 'Deseja excluir esta categoria?', confirmLabel: 'Excluir', isDestructive: true, 
                  onConfirm: () => { deleteCategory(id); if (selectedCategoryId === id) setSelectedCategoryId('root'); setConfirmModal(p => ({...p, isOpen: false})); }
                })}
                onMoveCategory={moveCategory} 
                onMoveQuestion={moveQuestion}
              />
            </div>
          </div>

          <div className={`p-6 border-t flex flex-col gap-2 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
            <button onClick={() => setShowImport(true)} className={`w-full py-3 rounded-xl font-bold text-sm transition ${theme === 'dark' ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}>
              <i className="fas fa-file-import mr-2"></i>Importar GIFT
            </button>
            <button onClick={() => downloadFile(exportToGift(store.categories, store.questions), `${registry.banks.find(b => b.id === registry.activeBankId)?.name || 'banco'}.gift.txt`)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition flex items-center justify-center gap-2">
              <Icons.Download /> Exportar Banco
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
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
              <h2 className="text-xl font-black truncate">{selectedCategory?.name || 'Explorador'}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={`p-2.5 rounded-xl transition ${theme === 'dark' ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
            </button>
            <button 
              onClick={() => { setCurrentQuestion(undefined); setIsEditingQuestion(true); }} 
              disabled={!selectedCategoryId} 
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Icons.Plus /> <span className="hidden sm:inline">Nova Questão</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-thin">
          {isEditingQuestion ? (
            <div className="max-w-5xl mx-auto">
              <button onClick={() => setIsEditingQuestion(false)} className="mb-6 text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-2 font-bold">
                <Icons.ArrowLeft /> Voltar
              </button>
              <QuestionForm 
                categoryId={selectedCategoryId!} categories={store.categories} initialData={currentQuestion} 
                onCancel={() => setIsEditingQuestion(false)} onSubmit={(d) => { saveQuestion(d, currentQuestion?.id); setIsEditingQuestion(false); }} 
              />
            </div>
          ) : (
            <div className="max-w-6xl mx-auto pb-12">
              {filteredQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center opacity-80">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${theme === 'dark' ? 'bg-slate-900 text-slate-700' : 'bg-slate-100 text-slate-300'}`}>
                    <i className="fas fa-ghost text-4xl"></i>
                  </div>
                  <h3 className="text-xl font-bold">Nenhuma questão aqui</h3>
                  <p className="text-slate-500 mt-2">Clique em "Nova Questão" ou mude a categoria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredQuestions.map(q => (
                    <div 
                      key={q.id} 
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'question', id: q.id }));
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={() => handleSelectQuestion(q)}
                      className={`p-6 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/50' : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 hover:bg-slate-50'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${q.type === QuestionType.MULTIPLE_CHOICE ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            {q.type === QuestionType.MULTIPLE_CHOICE ? 'Múltipla' : 'Dissertativa'}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg truncate group-hover:text-indigo-600 transition-colors">{q.name}</h3>
                        <div className={`text-sm line-clamp-1 mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} dangerouslySetInnerHTML={{ __html: q.content }} />
                      </div>
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handlePreviewQuestion(q); }} className="p-3 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl" title="Simular Moodle"><Icons.Search /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleSelectQuestion(q); }} className="p-3 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl"><Icons.Edit /></button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, title: 'Excluir Questão', message: `Deseja excluir "${q.name}"?`, confirmLabel: 'Excluir', isDestructive: true, onConfirm: () => { deleteQuestion(q.id); setConfirmModal(p => ({...p, isOpen: false})); }})}} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"><Icons.Trash /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <CategoryModal 
        isOpen={catModal.isOpen} 
        mode={catModal.mode} 
        name={catModal.name} 
        setName={(n) => setCatModal(p => ({...p, name: n}))} 
        onSubmit={handleCategorySubmit} 
        onClose={() => setCatModal(p => ({...p, isOpen: false}))} 
      />

      <ConfirmModal {...confirmModal} onClose={() => setConfirmModal(p => ({...p, isOpen: false}))} />
      
      <PreviewModal 
        isOpen={previewModal.isOpen} 
        question={previewModal.question} 
        onClose={() => setPreviewModal({ isOpen: false, question: null })} 
      />

      {/* Bank Modal */}
      {bankModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-6 animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {bankModal.mode === 'add' ? 'Novo Banco' : 'Renomear Banco'}
            </h2>
            <form onSubmit={handleBankSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Nome do Banco</label>
                <input 
                  autoFocus 
                  value={bankModal.name} 
                  onChange={(e) => setBankModal(p => ({...p, name: e.target.value}))} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 outline-none text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all" 
                  required 
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setBankModal(p => ({...p, isOpen: false}))} className="px-6 py-3 font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">Cancelar</button>
                <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none">
                  {bankModal.mode === 'add' ? 'Criar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showImport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className={`rounded-3xl w-full max-w-2xl shadow-2xl border p-8 space-y-6 animate-in zoom-in duration-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className="text-2xl font-black">Importar GIFT</h2>
            <textarea className={`w-full h-80 border rounded-2xl p-4 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} placeholder="$CATEGORY: top/..." value={importText} onChange={(e) => setImportText(e.target.value)} />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowImport(false)} className={`px-6 py-3 font-bold rounded-xl transition ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>Cancelar</button>
              <button onClick={handleImport} className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none">Importar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
