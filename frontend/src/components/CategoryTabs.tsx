import React, { useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
}) => {
  const allCategories = ['Все', ...categories];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showExpanded, setShowExpanded] = useState(false);

  const handleCategoryClick = (category: string) => {
    const categoryValue = category === 'Все' ? '' : category;
    onCategorySelect(categoryValue);
  };

  const toggleExpanded = () => {
    setShowExpanded(!showExpanded);
  };

  return (
    <div className="flex items-center px-3">
      <div ref={scrollRef} className="flex-1 flex overflow-x-auto no-scrollbar gap-3 py-2">
        {allCategories.map((category) => {
          const isSelected = (category === 'Все' && selectedCategory === '') ||
                           (category !== 'Все' && selectedCategory === category);

          return (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              aria-pressed={isSelected}
              style={{
                backgroundColor: isSelected ? '#3b82f6' : '#eff6ff',
                color: isSelected ? '#ffffff' : '#2563eb',
              }}
              className={`flex-shrink-0 whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none hover:opacity-90 ${
                isSelected ? 'shadow-md' : ''
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
      <button
        onClick={toggleExpanded}
        aria-label={showExpanded ? 'Свернуть категории' : 'Развернуть категории'}
        className="ml-3 w-10 h-10 flex-shrink-0 rounded-full border border-border bg-surface flex items-center justify-center hover:scale-105 transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        {showExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted" />
        )}
      </button>
    </div>
  );
};

export default CategoryTabs;