import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../api/client';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import Header from '../components/Header';
import CategoryTabs from '../components/CategoryTabs';
import FloatingCartButton from '../components/FloatingCartButton';
import { Product } from '../types/api';
import { useSearch } from '../contexts/SearchContext';

const Home: React.FC = () => {
  const { searchQuery } = useSearch();
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

  const [categories, setCategories] = useState<string[]>([]);
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

      console.log('🔍 Fetching products from:', url);
      const response = await apiFetch(url);
      console.log('📦 API Response:', response);
      if (response.success) {
        console.log('✅ Products loaded:', response.data.length);
        setProducts(response.data);

        // Extract unique options for filter dropdowns
        const uniqueCategories = [...new Set(response.data.map((p: Product) => p.category))].sort();
        const uniqueBrands = [...new Set(response.data.map((p: Product) => p.brand))].sort();
        const uniqueSizes = [...new Set(response.data.map((p: Product) => p.size))].sort();
        const uniqueColors = [...new Set(response.data.map((p: Product) => p.color))].sort();

        setCategories(uniqueCategories);
        setBrands(uniqueBrands);
        setSizes(uniqueSizes);
        setColors(uniqueColors);
        console.log('📊 Фильтры установлены:', { categories: uniqueCategories, brands: uniqueBrands, sizes: uniqueSizes, colors: uniqueColors });
      }
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(`Ошибка загрузки товаров: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync search query from context to filters
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: searchQuery
    }));
  }, [searchQuery]);

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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Header />
        <div className="max-w-screen-xl mx-auto px-4 py-4 pb-24" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Skeleton for category tabs */}
          <div style={{ height: '48px', backgroundColor: '#f3f4f6', borderRadius: '8px' }} />

          {/* Skeleton grid - 6 cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center text-sm mt-4" style={{ color: 'var(--color-error)' }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <div className="max-w-screen-xl mx-auto px-4 py-4 pb-24" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          selectedCategory={filters.category}
          onCategorySelect={(category) => handleFilterChange('category', category)}
        />

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>
            {filters.category || filters.brand || filters.search
              ? 'Товары по выбранным фильтрам не найдены'
              : 'Товары не найдены'
            }
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <FloatingCartButton />
    </div>
  );
};

export default Home;