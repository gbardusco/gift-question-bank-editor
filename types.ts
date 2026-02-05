
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  ESSAY = 'ESSAY'
}

export interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  categoryId: string;
  name: string;
  content: string; // HTML formatted string
  type: QuestionType;
  choices: Choice[];
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

export interface QuestionStore {
  categories: Category[];
  questions: Question[];
}

export interface BankMetadata {
  id: string;
  name: string;
}

export interface BankRegistry {
  banks: BankMetadata[];
  activeBankId: string;
}

export type Theme = 'light' | 'dark';
