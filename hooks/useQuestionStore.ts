import { useState, useEffect, useCallback } from 'react';
import { QuestionStore, Category, Question, BankRegistry, BankMetadata } from '../types.ts';
import { loadRegistry, saveRegistry, loadBankData, saveBankData, deleteBankData } from '../services/storageService.ts';

export const useQuestionStore = () => {
  const [registry, setRegistry] = useState<BankRegistry>(loadRegistry());
  const [store, setStore] = useState<QuestionStore>(() => loadBankData(registry.activeBankId));

  useEffect(() => {
    saveRegistry(registry);
  }, [registry]);

  useEffect(() => {
    saveBankData(registry.activeBankId, store);
  }, [store, registry.activeBankId]);

  const switchBank = useCallback((bankId: string) => {
    if (bankId === registry.activeBankId) return;
    setRegistry(prev => ({ ...prev, activeBankId: bankId }));
    setStore(loadBankData(bankId));
  }, [registry.activeBankId]);

  const createBank = useCallback((name: string) => {
    const newBankId = `bank_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newBank: BankMetadata = { id: newBankId, name };
    setRegistry(prev => ({ ...prev, banks: [...prev.banks, newBank] }));
    switchBank(newBankId);
  }, [switchBank]);

  const renameBank = useCallback((bankId: string, newName: string) => {
    setRegistry(prev => ({
      ...prev,
      banks: prev.banks.map(b => b.id === bankId ? { ...b, name: newName } : b)
    }));
  }, []);

  const deleteBank = useCallback((bankId: string) => {
    if (registry.banks.length <= 1) return;
    const isDeletingActive = bankId === registry.activeBankId;
    const remainingBanks = registry.banks.filter(b => b.id !== bankId);
    const newActiveId = isDeletingActive ? remainingBanks[0].id : registry.activeBankId;
    deleteBankData(bankId);
    setRegistry({ banks: remainingBanks, activeBankId: newActiveId });
    if (isDeletingActive) setStore(loadBankData(newActiveId));
  }, [registry.activeBankId, registry.banks]);

  const addCategory = useCallback((name: string, parentId: string | null) => {
    const newCatId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newCat: Category = { 
      id: newCatId, 
      name, 
      parentId 
    };
    setStore(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
    return newCatId;
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

  const isDescendant = useCallback((parentSearchId: string, potentialChildId: string | null): boolean => {
    if (!potentialChildId) return false;
    let current = store.categories.find(c => c.id === potentialChildId);
    while (current && current.parentId) {
      if (current.parentId === parentSearchId) return true;
      current = store.categories.find(c => c.id === current.parentId);
    }
    return false;
  }, [store.categories]);

  const moveCategory = useCallback((id: string, newParentId: string | null) => {
    if (id === newParentId) return;
    if (isDescendant(id, newParentId)) return;
    setStore(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, parentId: newParentId } : c)
    }));
  }, [isDescendant]);

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

  const duplicateQuestion = useCallback((id: string) => {
    const original = store.questions.find(q => q.id === id);
    if (!original) return;
    const copy: Question = {
      ...original,
      id: `q_copy_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: `${original.name} (Cópia)`,
      createdAt: Date.now()
    };
    setStore(prev => ({ ...prev, questions: [...prev.questions, copy] }));
  }, [store.questions]);

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
    setStore(prev => {
      // Avoid duplicated categories by ID or by Name-Parent path if necessary
      const newCategories = categories.filter(c => !prev.categories.some(pc => pc.id === c.id));
      return {
        categories: [...prev.categories, ...newCategories],
        questions: [...prev.questions, ...questions]
      };
    });
  }, []);

  return {
    registry,
    store,
    switchBank,
    createBank,
    renameBank,
    deleteBank,
    addCategory,
    editCategory,
    deleteCategory,
    moveCategory,
    saveQuestion,
    duplicateQuestion,
    deleteQuestion,
    moveQuestion,
    bulkImport
  };
};