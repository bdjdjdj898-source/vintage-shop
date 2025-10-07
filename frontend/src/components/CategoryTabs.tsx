import React from 'react';

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

  const handleCategoryClick = (category: string) => {
    const categoryValue = category === 'Все' ? '' : category;
    onCategorySelect(categoryValue);
  };

  return (
    <div className="flex overflow-x-auto no-scrollbar gap-3 px-3 py-2">
      {allCategories.map((category) => {
        const isSelected = (category === 'Все' && selectedCategory === '') ||
                         (category !== 'Все' && selectedCategory === category);

        return (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            aria-pressed={isSelected}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all duration-150 ${
              isSelected
                ? 'bg-accent text-white shadow-md'
                : 'bg-transparent text-text hover:bg-surface/60'
            }`}
            style={{ border: '1px solid var(--border)' }}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;