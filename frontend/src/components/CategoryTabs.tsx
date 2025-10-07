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
    <div className="flex overflow-x-auto no-scrollbar gap-2 px-3 pb-2">
      {allCategories.map((category) => {
        const isSelected = (category === 'Все' && selectedCategory === '') ||
                         (category !== 'Все' && selectedCategory === category);

        return (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`whitespace-nowrap rounded-full border text-sm font-medium px-4 py-1.5 transition-colors ${
              isSelected
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                : 'bg-transparent border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-neutral-800'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;