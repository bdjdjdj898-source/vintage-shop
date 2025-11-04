import React, { useEffect, useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import Header from '../components/Header';
import CategoryTabs from '../components/CategoryTabs';
import BottomNavigation from '../components/BottomNavigation';
import { Product } from '../types/api';
import { useSearch } from '../contexts/SearchContext';
import { useProducts } from '../contexts/ProductsContext';

const Home: React.FC = () => {
  const { searchQuery } = useSearch();
  const { allProducts, isLoadingAll, errorAll, fetchAllProducts } = useProducts();
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

  // Fetch all products once on mount
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // Extract unique filter options from all products
  const categories = useMemo(() => {
    if (!allProducts) return [];
    return [...new Set(allProducts.map(p => p.category))].sort();
  }, [allProducts]);

  const brands = useMemo(() => {
    if (!allProducts) return [];
    return [...new Set(allProducts.map(p => p.brand))].sort();
  }, [allProducts]);

  const sizes = useMemo(() => {
    if (!allProducts) return [];
    return [...new Set(allProducts.map(p => p.size))].sort();
  }, [allProducts]);

  const colors = useMemo(() => {
    if (!allProducts) return [];
    return [...new Set(allProducts.map(p => p.color))].sort();
  }, [allProducts]);

  // Filter products locally based on current filters
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];

    let filtered = [...allProducts];

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // Apply brand filter
    if (filters.brand) {
      filtered = filtered.filter(p => p.brand === filters.brand);
    }

    // Apply size filter
    if (filters.size) {
      filtered = filtered.filter(p => p.size === filters.size);
    }

    // Apply color filter
    if (filters.color) {
      filtered = filtered.filter(p => p.color === filters.color);
    }

    // Apply condition range filter
    if (filters.minCondition) {
      filtered = filtered.filter(p => p.condition >= parseInt(filters.minCondition));
    }
    if (filters.maxCondition) {
      filtered = filtered.filter(p => p.condition <= parseInt(filters.maxCondition));
    }

    // Apply price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice));
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    switch (filters.sort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return filtered;
  }, [allProducts, filters]);

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

  if (isLoadingAll) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', width: '100%', overflowX: 'hidden' }}>
        <Header />
        <div style={{ width: '100%', maxWidth: '100%', padding: '16px 16px 96px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Skeleton for category tabs */}
          <div style={{ height: '48px', backgroundColor: '#f3f4f6', borderRadius: '8px' }} />

          {/* Skeleton grid - 6 cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (errorAll) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center text-sm mt-4" style={{ color: 'var(--color-error)' }}>{errorAll}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', width: '100%', overflowX: 'hidden' }}>
      <Header />
      <div style={{ width: '100%', maxWidth: '100%', padding: '16px 16px 96px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          selectedCategory={filters.category}
          onCategorySelect={(category) => handleFilterChange('category', category)}
        />

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
            {filters.category || filters.brand || filters.search
              ? 'Товары по выбранным фильтрам не найдены'
              : 'Товары не найдены'
            }
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%' }}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Home;