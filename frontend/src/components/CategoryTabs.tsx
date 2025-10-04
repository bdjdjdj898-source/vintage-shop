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
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
      {allCategories.map((category) => {
        const isSelected = (category === 'Все' && selectedCategory === '') ||
                         (category !== 'Все' && selectedCategory === category);

        return (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
              isSelected
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-transparent border-gray-300 dark:border-gray-700'
            }`}
            style={{
              color: isSelected ? undefined : 'var(--color-text-secondary)'
            }}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;