import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import ProductCard from '../components/ProductCard';

interface Product {
  id: number;
  title: string;
  brand: string;
  category: string;
  size: string;
  color: string;
  condition: number;
  description: string;
  price: number;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiFetch('/api/products');
        if (response.success) {
          setProducts(response.data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Ошибка загрузки товаров');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product);
    // Здесь будет логика перехода на страницу товара
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Загрузка товаров...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Винтажная одежда
      </h1>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={handleProductClick}
          />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          Товары не найдены
        </div>
      )}
    </div>
  );
};

export default Home;