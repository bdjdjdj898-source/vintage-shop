import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../api/client';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import FilterPanel from '../components/FilterPanel';
import { Product } from '../types/api';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    size: '',
    color: '',
    minCondition: '',
    maxCondition: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sort: 'newest'
  });

  const categories = ['Куртки', 'Толстовки', 'Джинсы', 'Аксессуары', 'Обувь', 'Свитеры'];
  const [brands, setBrands] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.size) params.append('size', filters.size);
      if (filters.color) params.append('color', filters.color);
      if (filters.minCondition) params.append('minCondition', filters.minCondition);
      if (filters.maxCondition) params.append('maxCondition', filters.maxCondition);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.search) params.append('search', filters.search);
      if (filters.sort) params.append('sort', filters.sort);

      const queryString = params.toString();
      const url = `/api/products${queryString ? `?${queryString}` : ''}`;

      const response = await apiFetch(url);
      if (response.success) {
        setProducts(response.data);

        // Extract unique options for filter dropdowns
        const uniqueBrands = [...new Set(response.data.map((p: Product) => p.brand))].sort();
        const uniqueSizes = [...new Set(response.data.map((p: Product) => p.size))].sort();
        const uniqueColors = [...new Set(response.data.map((p: Product) => p.color))].sort();

        setBrands(uniqueBrands);
        setSizes(uniqueSizes);
        setColors(uniqueColors);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Ошибка загрузки товаров');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product);
    // Здесь будет логика перехода на страницу товара
  };

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      size: '',
      color: '',
      minCondition: '',
      maxCondition: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: 'newest'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-900 dark:text-white">Загрузка товаров...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Винтажная одежда
        </h1>

        {/* Filters */}
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          categories={categories}
          brands={brands}
          sizes={sizes}
          colors={colors}
          isLoading={isLoading}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-32">
            <div className="text-lg text-gray-900 dark:text-white">Загрузка товаров...</div>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={handleProductClick}
              />
            ))}
          </div>
        )}

        {/* No Products Found */}
        {!isLoading && products.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            {filters.category || filters.brand || filters.search
              ? 'Товары по выбранным фильтрам не найдены'
              : 'Товары не найдены'
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;