
import { Category, Question, QuestionType, QuestionStore, Choice } from '../types';

/**
 * Escapes special GIFT characters: ~ = # { } :
 */
const escapeGiftText = (text: string): string => {
  return text
    .replace(/:/g, '\\:')
    .replace(/~/g, '\\~')
    .replace(/=/g, '\\=')
    .replace(/#/g, '\\#')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}');
};

const getCategoryPath = (categoryId: string, categories: Category[]): string => {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return 'top';
  
  const pathParts: string[] = [category.name];
  let currentParentId = category.parentId;
  
  while (currentParentId) {
    const parent = categories.find(c => c.id === currentParentId);
    if (parent) {
      pathParts.unshift(parent.name);
      currentParentId = parent.parentId;
    } else {
      break;
    }
  }
  
  return `top/${pathParts.join('/')}`;
};

export const exportToGift = (
  categories: Category[], 
  questions: Question[], 
  selectedCategoryId?: string
): string => {
  let output = '';
  
  const targetCategories = selectedCategoryId 
    ? getDescendants(selectedCategoryId, categories)
    : categories;

  const questionsByCategory: Record<string, Question[]> = {};
  questions.forEach(q => {
    if (!questionsByCategory[q.categoryId]) {
      questionsByCategory[q.categoryId] = [];
    }
    questionsByCategory[q.categoryId].push(q);
  });

  targetCategories.forEach(cat => {
    const catPath = getCategoryPath(cat.id, categories);
    const catQuestions = questionsByCategory[cat.id] || [];
    
    output += `\n// question: 0  name: Switch category to ${catPath}\n`;
    output += `$CATEGORY: ${catPath}\n\n`;

    catQuestions.forEach(q => {
      output += `\n// question: ${q.id.substring(0, 4)}  name: ${q.name}\n`;
      output += `::${q.name}::[html]${escapeGiftText(q.content)}{\n`;
      
      if (q.type === QuestionType.MULTIPLE_CHOICE) {
        q.choices.forEach(choice => {
          const prefix = choice.isCorrect ? '=' : '~';
          output += `\t${prefix}${escapeGiftText(choice.text)}\n`;
        });
      }
      
      output += `}\n`;
    });
  });

  return output.trim();
};

const getDescendants = (rootId: string, categories: Category[]): Category[] => {
  const root = categories.find(c => c.id === rootId);
  if (!root) return [];
  
  const results: Category[] = [root];
  const children = categories.filter(c => c.parentId === rootId);
  
  children.forEach(child => {
    results.push(...getDescendants(child.id, categories));
  });
  
  return results;
};

export const parseGift = (text: string): Partial<QuestionStore> => {
  const categories: Category[] = [];
  const questions: Question[] = [];
  let currentCategoryId = 'root';

  // Basic check for root
  categories.push({ id: 'root', name: 'Imported Questions', parentId: null });

  const lines = text.split('\n');
  let currentBlock = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('$CATEGORY:')) {
      const path = line.replace('$CATEGORY:', '').trim();
      const parts = path.split('/').filter(p => p !== 'top');
      
      let lastId: string | null = null;
      parts.forEach((part, idx) => {
        let existing = categories.find(c => c.name === part && c.parentId === lastId);
        if (!existing) {
          const newId = `cat_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`;
          existing = { id: newId, name: part, parentId: lastId };
          categories.push(existing);
        }
        lastId = existing.id;
      });
      currentCategoryId = lastId || 'root';
      continue;
    }

    if (line === '' && currentBlock !== '') {
      processBlock(currentBlock);
      currentBlock = '';
    } else if (line !== '') {
      currentBlock += line + '\n';
    }
  }
  
  if (currentBlock !== '') processBlock(currentBlock);

  function processBlock(block: string) {
    if (block.startsWith('//') && !block.includes('::')) return;
    
    const titleMatch = block.match(/::([^:]+)::/);
    const title = titleMatch ? titleMatch[1] : 'Untitled Question';
    
    const contentMatch = block.match(/(?:^::[^:]+::)?(?:\[[^\]]+\])?\s*([\s\S]*?)\{([\s\S]*?)\}/);
    if (contentMatch) {
      const content = contentMatch[1].trim();
      const choicesText = contentMatch[2].trim();
      
      const isEssay = choicesText === '';
      const choices: Choice[] = [];
      
      if (!isEssay) {
        const choiceLines = choicesText.split('\n');
        choiceLines.forEach((cl, idx) => {
          const clean = cl.trim();
          if (clean.startsWith('=') || clean.startsWith('~')) {
            choices.push({
              id: `choice_${Date.now()}_${idx}`,
              isCorrect: clean.startsWith('='),
              text: clean.substring(1).trim()
            });
          }
        });
      }

      questions.push({
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        categoryId: currentCategoryId,
        name: title,
        content: content,
        type: isEssay ? QuestionType.ESSAY : QuestionType.MULTIPLE_CHOICE,
        choices,
        createdAt: Date.now()
      });
    }
  }

  return { categories, questions };
};

export const downloadFile = (content: string, filename: string) => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
