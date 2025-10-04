import React, { useState } from 'react';
import MobileFilterDrawer from './MobileFilterDrawer';
import useMediaQuery from '../hooks/useMediaQuery';

interface FilterPanelProps {
  filters: {
    category: string;
    brand: string;
    size: string;
    color: string;
    minCondition: string;
    maxCondition: string;
    minPrice: string;
    maxPrice: string;
    search: string;
    sort: string;
  };
  onFilterChange: (field: keyof FilterPanelProps['filters'], value: string) => void;
  onClearFilters: () => void;
  categories: string[];
  brands: string[];
  sizes: string[];
  colors: string[];
  isLoading?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  brands,
  sizes,
  colors,
  isLoading = false
}) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.brand) count++;
    if (filters.size) count++;
    if (filters.color) count++;
    if (filters.minCondition) count++;
    if (filters.maxCondition) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.search) count++;
    if (filters.sort !== 'newest') count++;
    return count;
  };

  const inputStyle = {
    backgroundColor: 'var(--color-card)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    width: '100%',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  };

  const labelStyle = {
    color: 'var(--color-text)',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.25rem',
    display: 'block'
  };

  const FilterContent = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Search */}
      <div>
        <label style={labelStyle}>
          Поиск
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          placeholder="Поиск по названию..."
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-light)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Brand Filter */}
      <div>
        <label style={labelStyle}>
          Бренд
        </label>
        <select
          value={filters.brand}
          onChange={(e) => onFilterChange('brand', e.target.value)}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-light)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <option value="">Все бренды</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* Size Filter */}
      <div>
        <label style={labelStyle}>
          Размер
        </label>
        <select
          value={filters.size}
          onChange={(e) => onFilterChange('size', e.target.value)}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-light)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <option value="">Все размеры</option>
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Color Filter */}
      <div>
        <label style={labelStyle}>
          Цвет
        </label>
        <select
          value={filters.color}
          onChange={(e) => onFilterChange('color', e.target.value)}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-light)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <option value="">Все цвета</option>
          {colors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Filter */}
      <div>
        <label style={labelStyle}>
          Сортировка
        </label>
        <select
          value={filters.sort}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-light)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <option value="newest">Сначала новые</option>
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
          <option value="brand_asc">По бренду (А-Я)</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="sm:col-span-2 lg:col-span-1">
        <label style={labelStyle}>
          Цена (₽)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            placeholder="От"
            min="0"
            step="100"
            style={{ ...inputStyle, width: '50%' }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-light)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            placeholder="До"
            min="0"
            step="100"
            style={{ ...inputStyle, width: '50%' }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-light)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>
    </div>
  );

  const activeFiltersCount = getActiveFiltersCount();
  const hasActiveFilters = activeFiltersCount > 0;

  if (isDesktop) {
    return (
      <div
        className="rounded-xl p-3 mb-4"
        style={{
          backgroundColor: 'var(--color-card)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="flex justify-between items-center mb-3 pb-3" style={{ borderBottom: '1px solid var(--color-border)', opacity: 0.4 }}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-accent)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Фильтры
            </h2>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-accent)' }}
            >
              Очистить ({activeFiltersCount})
            </button>
          )}
        </div>
        <FilterContent />
      </div>
    );
  }

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="mb-4">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="w-full flex items-center justify-between rounded-lg p-4 transition-all active:scale-95"
          style={{
            backgroundColor: 'var(--color-card)',
            color: 'var(--color-text)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-medium">Фильтры и сортировка</span>
          </div>
          {activeFiltersCount > 0 && (
            <span
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: '#ffffff'
              }}
            >
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      >
        <div className="space-y-4">
          <FilterContent />
        </div>

        {/* Drawer Actions */}
        <div className="mt-6 pt-6 space-y-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={() => {
              onClearFilters();
              setIsMobileDrawerOpen(false);
            }}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all active:scale-95"
            style={{
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              backgroundColor: 'transparent'
            }}
          >
            Очистить все
          </button>
          <button
            onClick={() => setIsMobileDrawerOpen(false)}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all active:scale-95"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: '#ffffff'
            }}
          >
            Применить фильтры
          </button>
        </div>
      </MobileFilterDrawer>
    </>
  );
};

export default FilterPanel;
