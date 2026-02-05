
import React, { useState } from 'react';
import { Question, QuestionType, Choice, Category } from '../types';
import RichTextEditor from './RichTextEditor';
import { Icons } from '../constants';

interface QuestionFormProps {
  initialData?: Question;
  categoryId: string;
  categories: Category[];
  onSubmit: (data: Partial<Question>) => void;
  onCancel: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ initialData, categoryId, categories, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [type, setType] = useState<QuestionType>(initialData?.type || QuestionType.MULTIPLE_CHOICE);
  const [targetCategoryId, setTargetCategoryId] = useState(initialData?.categoryId || categoryId);
  const [choices, setChoices] = useState<Choice[]>(initialData?.choices || [
    { id: '1', text: '', isCorrect: true },
    { id: '2', text: '', isCorrect: false },
  ]);

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

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {initialData ? 'Editar Questão' : 'Nova Questão'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Preencha os detalhes para sua questão Moodle.</p>
        </div>
        <button type="button" onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Título da Questão</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100"
            placeholder="Ex: Prova de História Q1"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tipo de Questão</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value as QuestionType)}
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100"
          >
            <option value={QuestionType.MULTIPLE_CHOICE}>Múltipla Escolha</option>
            <option value={QuestionType.ESSAY}>Dissertativa / Escrita</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Categoria Alvo</label>
          <select 
            value={targetCategoryId}
            onChange={(e) => setTargetCategoryId(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <RichTextEditor 
        label="Conteúdo da Questão"
        value={content}
        onChange={setContent}
      />

      {type === QuestionType.MULTIPLE_CHOICE && (
        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Opções de Resposta</h3>
            <button 
              type="button" 
              onClick={handleAddChoice}
              className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
            >
              <Icons.Plus /> Adicionar Opção
            </button>
          </div>
          
          <div className="space-y-4">
            {choices.map((choice, index) => (
              <div key={choice.id} className="flex items-start gap-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 relative group">
                <div className="flex flex-col items-center gap-2 pt-8">
                   <input 
                    type="radio" 
                    name="correct-choice"
                    checked={choice.isCorrect}
                    onChange={() => handleCorrectChange(choice.id)}
                    className="w-5 h-5 text-indigo-600 dark:text-indigo-500 border-slate-300 dark:border-slate-600 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Correta</span>
                </div>
                <div className="flex-1 min-w-0">
                  <RichTextEditor 
                    label={`Opção ${index + 1}`}
                    value={choice.text}
                    onChange={(val) => handleChoiceChange(choice.id, val)}
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => handleRemoveChoice(choice.id)}
                  disabled={choices.length <= 1}
                  className="mt-8 p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                >
                  <Icons.Trash />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-8 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 transition-all transform active:scale-95"
        >
          <Icons.Save /> Salvar Questão
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;
