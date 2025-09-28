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
    if (filters.category) count++;
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

  const FilterContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Поиск
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          placeholder="Поиск по названию..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Категория
        </label>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Все категории</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Brand Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Бренд
        </label>
        <select
          value={filters.brand}
          onChange={(e) => onFilterChange('brand', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Размер
        </label>
        <select
          value={filters.size}
          onChange={(e) => onFilterChange('size', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Цвет
        </label>
        <select
          value={filters.color}
          onChange={(e) => onFilterChange('color', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Сортировка
        </label>
        <select
          value={filters.sort}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Сначала новые</option>
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
          <option value="brand_asc">По бренду (А-Я)</option>
        </select>
      </div>

      {/* Min Condition Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Состояние от
        </label>
        <select
          value={filters.minCondition}
          onChange={(e) => onFilterChange('minCondition', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Любое</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((condition) => (
            <option key={condition} value={condition.toString()}>
              {condition}/10
            </option>
          ))}
        </select>
      </div>

      {/* Max Condition Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Состояние до
        </label>
        <select
          value={filters.maxCondition}
          onChange={(e) => onFilterChange('maxCondition', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Любое</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((condition) => (
            <option key={condition} value={condition.toString()}>
              {condition}/10
            </option>
          ))}
        </select>
      </div>

      {/* Min Price Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Цена от (₽)
        </label>
        <input
          type="number"
          value={filters.minPrice}
          onChange={(e) => onFilterChange('minPrice', e.target.value)}
          placeholder="Мин. цена"
          min="0"
          step="100"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Max Price Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Цена до (₽)
        </label>
        <input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => onFilterChange('maxPrice', e.target.value)}
          placeholder="Макс. цена"
          min="0"
          step="100"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const activeFiltersCount = getActiveFiltersCount();
  const hasActiveFilters = activeFiltersCount > 0;

  if (isDesktop) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Фильтры</h2>
        <FilterContent />

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="mt-4">
            <button
              onClick={onClearFilters}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Очистить фильтры
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="mb-4">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="w-full flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-gray-800 dark:text-white"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-medium">Фильтры</span>
          </div>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
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
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600 space-y-3">
          <button
            onClick={() => {
              onClearFilters();
              setIsMobileDrawerOpen(false);
            }}
            className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium"
          >
            Очистить все
          </button>
          <button
            onClick={() => setIsMobileDrawerOpen(false)}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
          >
            Применить
          </button>
        </div>
      </MobileFilterDrawer>
    </>
  );
};

export default FilterPanel;