import React, { useState, useEffect } from 'react';
import { Question, QuestionType, Choice, Category } from '../types.ts';
import RichTextEditor from './RichTextEditor.tsx';
import { Icons } from '../constants.tsx';

interface QuestionFormProps {
  initialData?: Question;
  categoryId: string;
  categories: Category[];
  onSubmit: (data: Partial<Question>) => void;
  onCancel: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ initialData, categoryId, categories, onSubmit, onCancel }) => {
  // Use local state that resets when initialData or categoryId changes
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
  const [targetCategoryId, setTargetCategoryId] = useState(categoryId);
  const [choices, setChoices] = useState<Choice[]>([
    { id: '1', text: '', isCorrect: true },
    { id: '2', text: '', isCorrect: false },
  ]);

  // Sync state with initialData when it changes (Edit vs New)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setContent(initialData.content);
      setType(initialData.type);
      setTargetCategoryId(initialData.categoryId);
      setChoices(initialData.choices.length > 0 ? initialData.choices : [
        { id: '1', text: '', isCorrect: true },
        { id: '2', text: '', isCorrect: false },
      ]);
    } else {
      setName('');
      setContent('');
      setType(QuestionType.MULTIPLE_CHOICE);
      setTargetCategoryId(categoryId);
      setChoices([
        { id: '1', text: '', isCorrect: true },
        { id: '2', text: '', isCorrect: false },
      ]);
    }
  }, [initialData, categoryId]);

  const handleAddChoice = () => {
    setChoices([...choices, { id: Date.now().toString(), text: '', isCorrect: false }]);
  };

  const handleRemoveChoice = (id: string) => {
    setChoices(choices.filter(c => c.id !== id));
  };

  const handleChoiceChange = (id: string, text: string) => {
    setChoices(choices.map(c => c.id === id ? { ...c, text } : c));
  };

  const handleCorrectChange = (id: string) => {
    setChoices(choices.map(c => ({ ...c, isCorrect: c.id === id })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      content,
      type,
      choices: type === QuestionType.MULTIPLE_CHOICE ? choices : [],
      categoryId: targetCategoryId
    });
  };

  const isEditMode = !!initialData;

  return (
    <form onSubmit={handleSubmit} className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl border p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isEditMode ? 'border-indigo-200 dark:border-indigo-900/50' : 'border-emerald-200 dark:border-emerald-900/50'}`}>
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${isEditMode ? 'bg-indigo-600 shadow-indigo-200' : 'bg-emerald-600 shadow-emerald-200'}`} aria-hidden="true">
            {isEditMode ? <Icons.Edit /> : <Icons.Plus />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
              {isEditMode ? 'Editando Questão' : 'Nova Questão'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {isEditMode ? 'Atualize os detalhes da questão existente.' : 'Crie uma nova questão do zero para o banco.'}
            </p>
          </div>
        </div>
        <button type="button" onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" aria-label="Fechar formulário">
          <i className="fas fa-times text-xl" aria-hidden="true"></i>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="q-title" className="text-xs font-black uppercase text-slate-400 tracking-widest">Título da Questão</label>
          <input 
            id="q-title"
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 transition-all"
            placeholder="Ex: Prova de História Q1"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="q-type" className="text-xs font-black uppercase text-slate-400 tracking-widest">Tipo de Questão</label>
          <select 
            id="q-type"
            value={type}
            onChange={(e) => setType(e.target.value as QuestionType)}
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 transition-all cursor-pointer"
          >
            <option value={QuestionType.MULTIPLE_CHOICE}>Múltipla Escolha</option>
            <option value={QuestionType.ESSAY}>Dissertativa / Escrita</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="q-cat" className="text-xs font-black uppercase text-slate-400 tracking-widest">Categoria Destino</label>
          <select 
            id="q-cat"
            value={targetCategoryId}
            onChange={(e) => setTargetCategoryId(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 transition-all cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <RichTextEditor 
        label="Enunciado da Questão"
        value={content}
        onChange={setContent}
      />

      {type === QuestionType.MULTIPLE_CHOICE && (
        <section className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800" aria-label="Alternativas">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">Opções de Resposta</h3>
            <button 
              type="button" 
              onClick={handleAddChoice}
              className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-100 transition-colors"
              aria-label="Adicionar nova alternativa"
            >
              <Icons.Plus aria-hidden="true" /> Adicionar Opção
            </button>
          </div>
          
          <div className="space-y-4">
            {choices.map((choice, index) => (
              <div key={choice.id} className="flex items-start gap-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 relative group transition-all hover:shadow-md">
                <div className="flex flex-col items-center gap-2 pt-10">
                   <input 
                    type="radio" 
                    name="correct-choice"
                    checked={choice.isCorrect}
                    onChange={() => handleCorrectChange(choice.id)}
                    className="w-6 h-6 text-indigo-600 dark:text-indigo-500 border-slate-300 dark:border-slate-600 focus:ring-indigo-500 cursor-pointer"
                    aria-label={`Marcar alternativa ${index + 1} como correta`}
                  />
                  <span className={`text-[9px] uppercase font-black tracking-widest ${choice.isCorrect ? 'text-indigo-600' : 'text-slate-400'}`} aria-hidden="true">
                    {choice.isCorrect ? 'Correta' : 'Falsa'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <RichTextEditor 
                    label={`Texto da Alternativa ${index + 1}`}
                    value={choice.text}
                    onChange={(val) => handleChoiceChange(choice.id, val)}
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => handleRemoveChoice(choice.id)}
                  disabled={choices.length <= 1}
                  className="mt-10 p-2 text-slate-400 hover:text-red-500 disabled:opacity-20 transition-colors"
                  title="Remover opção"
                  aria-label={`Excluir alternativa ${index + 1}`}
                >
                  <Icons.Trash aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-end gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-10 py-4 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-slate-500 dark:text-slate-400 hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
        >
          Descartar
        </button>
        <button 
          type="submit" 
          className={`px-10 py-4 rounded-xl font-black text-white shadow-xl transition-all transform active:scale-95 flex items-center gap-3 uppercase text-xs tracking-widest ${isEditMode ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none'}`}
        >
          <Icons.Save aria-hidden="true" /> {isEditMode ? 'Atualizar Questão' : 'Criar Questão'}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;