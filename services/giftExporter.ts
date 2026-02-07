import { Category, Question, QuestionType, QuestionStore, Choice, GIFTValidationError } from '../types';

const escapeGiftText = (text: string): string => {
  return text
    .replace(/:/g, '\\:')
    .replace(/~/g, '\\~')
    .replace(/=/g, '\\=')
    .replace(/#/g, '\\#')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}');
};

/**
 * Removes GIFT escapes. Moodle escapes many characters like :, ~, =, #, {, }, ", '.
 */
const giftUnescape = (text: string): string => {
  return text.replace(/\\(.)/g, '$1');
};

/**
 * Aggressively cleans HTML attributes that clutter the Moodle import.
 */
const cleanHtml = (html: string): string => {
  if (!html) return '';
  
  let cleaned = html;
  const attrsToStrip = ['dir', 'style', 'id', 'class', 'lang', 'face', 'size', 'color', 'border', 'cellpadding', 'cellspacing'];
  
  attrsToStrip.forEach(attr => {
    const regex = new RegExp(`\\s+${attr}\\s*=\\s*(["'])(?:(?=(\\\\?))\\2.)*?\\1`, 'gi');
    cleaned = cleaned.replace(regex, '');
    const fallbackRegex = new RegExp(`\\s+${attr}\\s*=[^\\s>]+`, 'gi');
    cleaned = cleaned.replace(fallbackRegex, '');
  });

  cleaned = cleaned.replace(/<([a-z1-6]+)\s+>/gi, '<$1>');
  return cleaned.trim();
};

/**
 * Refactored for Moodle 5.0 Compatibility:
 * 1. Removed manual "top/" prefix which causes duplication.
 * 2. Applied .trim() to all parts to prevent invisible whitespace duplicates.
 */
const getCategoryPath = (categoryId: string, categories: Category[]): string => {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return '';
  
  const pathParts: string[] = [category.name.trim()];
  let currentParentId = category.parentId;
  
  while (currentParentId) {
    const parent = categories.find(c => c.id === currentParentId);
    if (parent) {
      pathParts.unshift(parent.name.trim());
      currentParentId = parent.parentId;
    } else {
      break;
    }
  }
  
  return pathParts.join('/');
};

/**
 * Enhanced Export with Context Support and proper Block Spacing.
 */
export const exportToGift = (
  categories: Category[], 
  questions: Question[], 
  selectedCategoryId?: string,
  contextPrefix?: string // e.g. "$course$", "$module$", or empty
): string => {
  let output = '// GIFT Export generated for Moodle 5.0+ compatibility\n';
  
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
    const rawPath = getCategoryPath(cat.id, categories);
    if (!rawPath) return;

    // Normalizing Context: Ensure context doesn't have trailing slash and rawPath doesn't have leading
    const cleanContext = contextPrefix ? contextPrefix.trim().replace(/\/$/, '') : '';
    const catPath = cleanContext ? `${cleanContext}/${rawPath}` : rawPath;

    const catQuestions = questionsByCategory[cat.id] || [];
    
    // Moodle 5.0 requires clear double-newline separation for blocks
    output += `\n\n// context: ${cleanContext || 'default'} name: Switch category to ${catPath}\n`;
    output += `$CATEGORY: ${catPath}\n\n`;

    catQuestions.forEach(q => {
      output += `\n// question: ${q.id.substring(0, 4)}  name: ${q.name.trim()}\n`;
      output += `::${q.name.trim()}::[html]${escapeGiftText(q.content)}{\n`;
      if (q.type === QuestionType.MULTIPLE_CHOICE) {
        q.choices.forEach(choice => {
          const prefix = choice.isCorrect ? '=' : '~';
          output += `\t${prefix}${escapeGiftText(choice.text.trim())}\n`;
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

export const validateGift = (text: string): GIFTValidationError[] => {
  const errors: GIFTValidationError[] = [];
  if (!text.trim()) return errors;

  const lines = text.split('\n');
  let currentBlock: string[] = [];
  let blockStartLine = 1;

  lines.forEach((line, idx) => {
    const currentLineNum = idx + 1;
    if (line.trim() === '') {
      if (currentBlock.length > 0) {
        validateBlock(currentBlock, blockStartLine, errors);
        currentBlock = [];
      }
      blockStartLine = currentLineNum + 1;
    } else {
      currentBlock.push(line);
    }
  });

  if (currentBlock.length > 0) {
    validateBlock(currentBlock, blockStartLine, errors);
  }

  return errors;
};

function validateBlock(blockLines: string[], startLine: number, errors: GIFTValidationError[]) {
  const blockText = blockLines.join('\n');
  const trimmedBlock = blockText.trim();

  if (trimmedBlock.startsWith('//')) return;
  if (trimmedBlock.startsWith('$CATEGORY:')) {
    if (trimmedBlock.split(':').length < 2 || !trimmedBlock.split(':')[1].trim()) {
      errors.push({
        line: startLine,
        severity: 'error',
        message: 'A tag $CATEGORY: está mal formatada ou vazia.',
        text: blockLines[0]
      });
    }
    return;
  }

  if (!blockText.includes('::')) {
    errors.push({
      line: startLine,
      severity: 'error',
      message: 'Questão sem título definido. Use ::nome da questão::.',
      text: blockLines[0].substring(0, 50)
    });
  }

  const openBrace = blockText.indexOf('{');
  const closeBrace = blockText.indexOf('}');

  if (openBrace === -1) {
    errors.push({
      line: startLine,
      severity: 'error',
      message: 'Faltando abertura de chaves { no corpo da questão.',
      text: blockText.substring(0, 40) + '...'
    });
  } else if (closeBrace === -1) {
    errors.push({
      line: startLine,
      severity: 'error',
      message: 'Faltando fechamento de chaves } no corpo da questão.',
      text: blockText.substring(openBrace, openBrace + 40) + '...'
    });
  } else {
    const inner = blockText.substring(openBrace + 1, closeBrace).trim();
    if (inner !== '') {
      const hasCorrect = inner.includes('=');
      const hasDistractor = inner.includes('~');
      
      if (!hasCorrect && hasDistractor) {
        errors.push({
          line: startLine + blockLines.findIndex(l => l.includes('{')),
          severity: 'warning',
          message: 'Questão de múltipla escolha sem resposta correta (=).',
          text: inner.substring(0, 30)
        });
      }
      
      if (!hasCorrect && !hasDistractor) {
        errors.push({
          line: startLine,
          severity: 'warning',
          message: 'Conteúdo dentro das chaves não parece ser múltipla escolha nem dissertativa.',
          text: inner.substring(0, 30)
        });
      }
    }
  }
}

export const parseGift = (text: string): Partial<QuestionStore> => {
  const categories: Category[] = [];
  const questions: Question[] = [];
  let currentCategoryId = 'root';

  if (!categories.some(c => c.id === 'root')) {
    categories.push({ id: 'root', name: 'Importação', parentId: null });
  }

  const initialBlocks = text.split(/\n\s*\n/);
  
  for (const block of initialBlocks) {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) continue;

    const lines = trimmedBlock.split('\n');
    let questionLines: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('$CATEGORY:')) {
        if (questionLines.length > 0) {
          processQuestionBlock(questionLines.join('\n'), currentCategoryId, questions);
          questionLines = [];
        }

        const path = trimmedLine.replace('$CATEGORY:', '').trim();
        if (path) {
          const parts = path.split('/').filter(p => p !== 'top' && p !== '');
          let lastId: string | null = null;
          parts.forEach((part, idx) => {
            let existing = categories.find(c => c.name === part.trim() && c.parentId === lastId);
            if (!existing) {
              const newId = `cat_imp_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`;
              existing = { id: newId, name: part.trim(), parentId: lastId };
              categories.push(existing);
            }
            lastId = existing.id;
          });
          currentCategoryId = lastId || 'root';
        }
      } else {
        questionLines.push(line);
      }
    }

    if (questionLines.length > 0) {
      processQuestionBlock(questionLines.join('\n'), currentCategoryId, questions);
    }
  }

  return { categories, questions };
};

function processQuestionBlock(blockText: string, categoryId: string, questions: Question[]) {
  const cleanLines = blockText.split('\n').filter(l => !l.trim().startsWith('//'));
  const cleanBlock = cleanLines.join('\n').trim();
  if (!cleanBlock) return;

  const titleMatch = cleanBlock.match(/::([^:]+)::/);
  const title = titleMatch ? titleMatch[1].trim() : 'Questão Sem Título';
  
  const openBraceIndex = cleanBlock.indexOf('{');
  const closeBraceIndex = cleanBlock.lastIndexOf('}');
  
  if (openBraceIndex !== -1 && closeBraceIndex !== -1) {
    let bodyPart = cleanBlock.substring(0, openBraceIndex);
    if (titleMatch) {
      bodyPart = bodyPart.substring(bodyPart.indexOf('::', bodyPart.indexOf('::') + 2) + 2);
    }
    
    let content = bodyPart.replace(/\[[^\]]+\]/, '').trim();
    content = cleanHtml(giftUnescape(content));
    
    const choicesText = cleanBlock.substring(openBraceIndex + 1, closeBraceIndex).trim();
    const isEssay = choicesText === '';
    
    const choices: Choice[] = [];
    if (!isEssay) {
      const choiceLines = choicesText.split(/(?<!\\)(?=[=~#])/);
      
      choiceLines.forEach((cl, idx) => {
        const rawLine = cl.trim();
        if (rawLine.startsWith('=') || rawLine.startsWith('~')) {
          const isCorrect = rawLine.startsWith('=');
          let textPart = rawLine.substring(1).split(/(?<!\\)#/)[0].trim();
          textPart = cleanHtml(giftUnescape(textPart));

          if (textPart) {
            choices.push({
              id: `ch_imp_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
              isCorrect,
              text: textPart
            });
          }
        }
      });
    }

    questions.push({
      id: `q_imp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      categoryId: categoryId,
      name: title,
      content: content || 'Sem enunciado',
      type: isEssay ? QuestionType.ESSAY : QuestionType.MULTIPLE_CHOICE,
      choices,
      createdAt: Date.now()
    });
  }
}

export const downloadFile = (content: string, filename: string) => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};