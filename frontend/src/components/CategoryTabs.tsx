import React, { useState, useRef, useEffect } from 'react';

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
  const [showDropdown, setShowDropdown] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // All categories including "Все" option
  const allCategories = ['Все', ...categories];

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
    }

    return () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', checkScrollButtons);
      }
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryClick = (category: string) => {
    const categoryValue = category === 'Все' ? '' : category;
    onCategorySelect(categoryValue);
    setShowDropdown(false);
  };

  const getDisplayCategory = () => {
    return selectedCategory === '' ? 'Все' : selectedCategory;
  };

  return (
    <>
      {/* Desktop: Horizontal Scrollable Tabs */}
      <div className="hidden md:block bg-card rounded-lg shadow-sm p-2 mb-6">
        <div className="relative">
          {/* Left Scroll Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-card shadow-md rounded-full p-2 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-2 overflow-x-auto scrollbar-hide px-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allCategories.map((category) => {
              const isSelected = (category === 'Все' && selectedCategory === '') ||
                               (category !== 'Все' && selectedCategory === category);

              return (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`
                    flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${isSelected
                      ? 'bg-accent text-white shadow-md'
                      : 'bg-gray-100 text-text hover:bg-gray-200 hover:text-accent'
                    }
                  `}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Right Scroll Button */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-card shadow-md rounded-full p-2 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile: Dropdown */}
      <div className="md:hidden mb-4">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between bg-card rounded-lg shadow-sm p-4 text-text"
          >
            <span className="font-medium">{getDisplayCategory()}</span>
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg shadow-lg border border-border z-20 max-h-60 overflow-y-auto">
              {allCategories.map((category) => {
                const isSelected = (category === 'Все' && selectedCategory === '') ||
                                 (category !== 'Все' && selectedCategory === category);

                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`
                      w-full text-left px-4 py-3 transition-colors
                      ${isSelected
                        ? 'bg-accent text-white'
                        : 'text-text hover:bg-gray-50'
                      }
                      ${category === allCategories[0] ? 'rounded-t-lg' : ''}
                      ${category === allCategories[allCategories.length - 1] ? 'rounded-b-lg' : ''}
                    `}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Backdrop for mobile dropdown */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    </>
  );
};

export default CategoryTabs;