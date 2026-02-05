
import { useState, useEffect, useCallback } from 'react';
import { QuestionStore, Category, Question } from '../types';
import { loadFromLocalStorage, saveToLocalStorage } from '../services/storageService';

export const useQuestionStore = () => {
  const [store, setStore] = useState<QuestionStore>(loadFromLocalStorage());

  useEffect(() => {
    saveToLocalStorage(store);
  }, [store]);

  const addCategory = useCallback((name: string, parentId: string | null) => {
    const newCat: Category = { 
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, 
      name, 
      parentId 
    };
    setStore(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
  }, []);

  const editCategory = useCallback((id: string, name: string) => {
    setStore(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, name } : c)
    }));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    const idsToDelete = [id];
    const findDescendants = (parentId: string) => {
      store.categories.filter(c => c.parentId === parentId).forEach(child => {
        idsToDelete.push(child.id);
        findDescendants(child.id);
      });
    };
    findDescendants(id);

    setStore(prev => ({
      categories: prev.categories.filter(c => !idsToDelete.includes(c.id)),
      questions: prev.questions.filter(q => !idsToDelete.includes(q.categoryId))
    }));
    return idsToDelete;
  }, [store.categories]);

  const moveCategory = useCallback((id: string, newParentId: string | null) => {
    setStore(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, parentId: newParentId } : c)
    }));
  }, []);

  const saveQuestion = useCallback((data: Partial<Question>, currentId?: string) => {
    if (currentId) {
      setStore(prev => ({
        ...prev,
        questions: prev.questions.map(q => q.id === currentId ? { ...q, ...data } as Question : q)
      }));
    } else {
      const newQuestion: Question = {
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        createdAt: Date.now(),
        ...(data as Omit<Question, 'id' | 'createdAt'>)
      } as Question;
      setStore(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
    }
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setStore(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== id) }));
  }, []);

  const moveQuestion = useCallback((questionId: string, newCategoryId: string) => {
    setStore(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === questionId ? { ...q, categoryId: newCategoryId } : q)
    }));
  }, []);

  const bulkImport = useCallback((categories: Category[], questions: Question[]) => {
    setStore(prev => ({
      categories: [...prev.categories, ...categories.filter(c => !prev.categories.some(pc => pc.id === c.id))],
      questions: [...prev.questions, ...questions]
    }));
  }, []);

  return {
    store,
    addCategory,
    editCategory,
    deleteCategory,
    moveCategory,
    saveQuestion,
    deleteQuestion,
    moveQuestion,
    bulkImport
  };
};
