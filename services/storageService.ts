
import { QuestionStore, Category, Question } from '../types';
import { APP_STORAGE_KEY } from '../constants';

export const saveToLocalStorage = (data: QuestionStore) => {
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data));
};

export const loadFromLocalStorage = (): QuestionStore => {
  const saved = localStorage.getItem(APP_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved data', e);
    }
  }
  return {
    categories: [{ id: 'root', name: 'PADRÃO PARA O EAD', parentId: null }],
    questions: []
  };
};
