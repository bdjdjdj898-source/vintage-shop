import React, { useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Add this to hide scrollbar
const scrollContainerStyle = document.createElement('style');
scrollContainerStyle.textContent = `
  .category-scroll::-webkit-scrollbar {
    display: none;
  }
`;
if (!document.querySelector('#category-scroll-style')) {
  scrollContainerStyle.id = 'category-scroll-style';
  document.head.appendChild(scrollContainerStyle);
}

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
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
      <div
        ref={scrollRef}
        className="category-scroll"
        style={{
          flex: 1,
          display: 'flex',
          overflowX: 'auto',
          gap: '12px',
          padding: '8px 0',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {allCategories.map((category) => {
          const isSelected = (category === 'Все' && selectedCategory === '') ||
                           (category !== 'Все' && selectedCategory === category);

          return (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              aria-pressed={isSelected}
              style={{
                backgroundColor: isSelected ? '#1f2937' : '#f3f4f6',
                color: isSelected ? '#ffffff' : '#6b7280',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 150ms',
                border: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
            >
              {category}
            </button>
          );
        })}
      </div>
      <button
        onClick={toggleExpanded}
        aria-label={showExpanded ? 'Свернуть категории' : 'Развернуть категории'}
        style={{
          marginLeft: '12px',
          width: '40px',
          height: '40px',
          flexShrink: 0,
          borderRadius: '50%',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 150ms',
          cursor: 'pointer',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {showExpanded ? (
          <ChevronUp size={20} style={{ color: '#9ca3af' }} />
        ) : (
          <ChevronDown size={20} style={{ color: '#9ca3af' }} />
        )}
      </button>
    </div>
  );
};

export default CategoryTabs;