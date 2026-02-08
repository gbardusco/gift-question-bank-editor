import { QuestionStore, BankRegistry, BankMetadata } from '../types.ts';
import { APP_REGISTRY_KEY, BANK_STORAGE_PREFIX } from '../constants.tsx';

export const saveBankData = (bankId: string, data: QuestionStore) => {
  localStorage.setItem(`${BANK_STORAGE_PREFIX}${bankId}`, JSON.stringify(data));
};

export const loadBankData = (bankId: string): QuestionStore => {
  const saved = localStorage.getItem(`${BANK_STORAGE_PREFIX}${bankId}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse bank data', e);
    }
  }
  return {
    categories: [{ id: 'root', name: 'PADRÃO PARA O EAD', parentId: null }],
    questions: []
  };
};

export const deleteBankData = (bankId: string) => {
  localStorage.removeItem(`${BANK_STORAGE_PREFIX}${bankId}`);
};

export const saveRegistry = (registry: BankRegistry) => {
  localStorage.setItem(APP_REGISTRY_KEY, JSON.stringify(registry));
};

export const loadRegistry = (): BankRegistry => {
  const saved = localStorage.getItem(APP_REGISTRY_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse registry', e);
    }
  }
  
  const defaultBankId = 'default_bank';
  return {
    banks: [{ id: defaultBankId, name: 'Banco Principal' }],
    activeBankId: defaultBankId
  };
};