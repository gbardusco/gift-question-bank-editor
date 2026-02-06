import React, { useState, useEffect } from 'react';
import { Category, Question } from '../types';
import { Icons } from '../constants';

interface CategoryTreeProps {
  categories: Category[];
  questions: Question[];
  selectedCategoryId: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelectCategory: (id: string) => void;
  onSelectQuestion: (question: Question) => void;
  onPreviewQuestion: (question: Question) => void;
  onAddSubcategory: (parentId: string) => void;
  onEditCategory: (id: string) => void;
  onDeleteCategory: (id: string) => void;
  onMoveCategory: (id: string, newParentId: string | null) => void;
  onMoveQuestion: (questionId: string, newCategoryId: string) => void;
}

const CategoryNode: React.FC<{
  category: Category;
  categories: Category[];
  questions: Question[];
  depth: number;
  selectedCategoryId: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelectCategory: (id: string) => void;
  onSelectQuestion: (question: Question) => void;
  onPreviewQuestion: (question: Question) => void;
  onAddSubcategory: (parentId: string) => void;
  onEditCategory: (id: string) => void;
  onDeleteCategory: (id: string) => void;
  onMoveCategory: (id: string, newParentId: string | null) => void;
  onMoveQuestion: (questionId: string, newCategoryId: string) => void;
}> = ({ 
  category, categories, questions, depth, selectedCategoryId, expandedIds, onToggleExpand, onSelectCategory, onSelectQuestion, onPreviewQuestion,
  onAddSubcategory, onEditCategory, onDeleteCategory, onMoveCategory, onMoveQuestion
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const isOpen = expandedIds.has(category.id);
  
  const childCategories = categories.filter(c => c.parentId === category.id);
  const categoryQuestions = questions.filter(q => q.categoryId === category.id);
  const isSelected = selectedCategoryId === category.id;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'category') {
        if (data.id !== category.id) onMoveCategory(data.id, category.id);
      } else if (data.type === 'question') {
        onMoveQuestion(data.id, category.id);
      }
    } catch (err) {
      console.error("Drop failed", err);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'category', id: category.id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex flex-col">
      <div 
        draggable={category.id !== 'root'}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group flex items-center justify-between py-1.5 px-3 rounded-xl cursor-pointer transition-all mb-0.5 ${
          isSelected 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
            : isDragOver 
              ? 'bg-indigo-500/10 dark:bg-indigo-900/30 ring-1 ring-indigo-500'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
        }`}
        style={{ marginLeft: `${depth * 0.75}rem` }}
        onClick={() => onSelectCategory(category.id)}
      >
        <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleExpand(category.id); }} 
            className={`transition-transform duration-200 pointer-events-auto p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded ${isOpen ? '' : '-rotate-90'} ${(childCategories.length === 0 && categoryQuestions.length === 0) ? 'invisible' : ''}`}
          >
            <Icons.ChevronDown />
          </button>
          <span className="flex-shrink-0">
            {isSelected ? <i className="fa-solid fa-folder-open text-white"></i> : (isOpen ? <Icons.FolderOpen /> : <Icons.Folder />)}
          </span>
          <span className="truncate text-sm font-bold tracking-tight">{category.name}</span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onAddSubcategory(category.id); }} className={`p-1 rounded-lg ${isSelected ? 'hover:bg-indigo-500' : 'hover:bg-white dark:hover:bg-slate-700'}`} title="Nova Subcategoria"><Icons.Plus /></button>
          <button onClick={(e) => { e.stopPropagation(); onEditCategory(category.id); }} className={`p-1 rounded-lg ${isSelected ? 'hover:bg-indigo-500' : 'hover:bg-white dark:hover:bg-slate-700'}`} title="Editar"><Icons.Edit /></button>
          {category.id !== 'root' && (
            <button onClick={(e) => { e.stopPropagation(); onDeleteCategory(category.id); }} className={`p-1 rounded-lg ${isSelected ? 'hover:bg-indigo-500' : 'hover:bg-white dark:hover:bg-slate-700 hover:text-red-500'}`} title="Excluir"><Icons.Trash /></button>
          )}
        </div>
      </div>
      
      {isOpen && (
        <div className="flex flex-col">
          {childCategories.map(child => (
            <CategoryNode 
              key={child.id} category={child} categories={categories} questions={questions} depth={depth + 1} selectedCategoryId={selectedCategoryId} 
              expandedIds={expandedIds} onToggleExpand={onToggleExpand}
              onSelectCategory={onSelectCategory} onSelectQuestion={onSelectQuestion} onPreviewQuestion={onPreviewQuestion} onAddSubcategory={onAddSubcategory} 
              onEditCategory={onEditCategory} onDeleteCategory={onDeleteCategory} onMoveCategory={onMoveCategory} onMoveQuestion={onMoveQuestion} 
            />
          ))}
          {categoryQuestions.map(q => (
            <div
              key={q.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify({ type: 'question', id: q.id }));
                e.dataTransfer.effectAllowed = 'move';
              }}
              onClick={(e) => { e.stopPropagation(); onSelectQuestion(q); }}
              className="group flex items-center justify-between py-1 px-3 rounded-lg cursor-grab active:cursor-grabbing hover:bg-slate-100 dark:hover:bg-slate-800 transition-all mb-0.5"
              style={{ marginLeft: `${(depth + 1) * 0.75 + 1.25}rem` }}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="flex-shrink-0 opacity-70"><Icons.File /></span>
                <span className="truncate text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-indigo-500 transition-colors">{q.name}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onPreviewQuestion(q); }}
                className="p-1 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-all"
                title="Preview Moodle"
              >
                <Icons.Search />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryTree: React.FC<CategoryTreeProps> = (props) => {
  const rootCategories = props.categories.filter(c => c.parentId === null);
  return (
    <div className="space-y-0.5">
      {rootCategories.map(cat => <CategoryNode key={cat.id} category={cat} categories={props.categories} questions={props.questions} depth={0} {...props} />)}
    </div>
  );
};

export default CategoryTree;