import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useCart } from '../contexts/CartContext';
import { useSwipe } from '../hooks/useSwipe';
import Header from '../components/Header';
import { Product } from '../types/api';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await apiFetch(`/api/products/${id}`);
        if (response.success) {
          setProduct(response.data);
        } else {
          setError('Товар не найден');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Ошибка загрузки товара');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setIsAddingToCart(true);
      await addToCart(product.id);
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!product?.images) return;

    const totalImages = product.images.length;
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
    } else {
      setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const getConditionText = (condition: number) => {
    if (condition >= 9) return 'Отличное';
    if (condition >= 7) return 'Хорошее';
    if (condition >= 5) return 'Удовлетворительное';
    return 'Требует внимания';
  };

  // Swipe handlers for image navigation
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => handleImageNavigation('next'),
    onSwipeRight: () => handleImageNavigation('prev'),
  }, {
    threshold: 50,
    preventDefaultTouchmoveEvent: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-text">Загрузка товара...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-lg text-error">{error || 'Товар не найден'}</div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90 transition-opacity"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-text-secondary hover:text-text transition-colors mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Назад</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-card rounded-lg overflow-hidden shadow-md">
              <div
                className="relative h-96 lg:h-[500px] cursor-zoom-in touch-pan-y"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                {...swipeHandlers}
              >
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.title}
                  className={`w-full h-full object-cover transition-transform duration-200 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                  style={
                    isZoomed
                      ? {
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        }
                      : {}
                  }
                />

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageNavigation('prev')}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleImageNavigation('next')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex
                        ? 'border-accent'
                        : 'border-border hover:border-accent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">{product.title}</h1>
              <p className="text-xl text-text-secondary">{product.brand}</p>
            </div>

            <div className="text-3xl font-bold text-accent">
              {formatPrice(product.price)} ₽
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-border">
              <div>
                <span className="text-text-secondary">Категория:</span>
                <p className="text-text font-medium">{product.category}</p>
              </div>
              <div>
                <span className="text-text-secondary">Размер:</span>
                <p className="text-text font-medium">{product.size}</p>
              </div>
              <div>
                <span className="text-text-secondary">Цвет:</span>
                <p className="text-text font-medium">{product.color}</p>
              </div>
              <div>
                <span className="text-text-secondary">Состояние:</span>
                <p className="text-text font-medium">
                  {product.condition}/10 ({getConditionText(product.condition)})
                </p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-text mb-2">Описание</h3>
                <p className="text-text-secondary leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !product.isActive}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                product.isActive
                  ? 'bg-accent text-white hover:opacity-90 active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isAddingToCart
                ? 'Добавление...'
                : product.isActive
                ? 'Добавить в корзину'
                : 'Товар недоступен'}
            </button>

            {/* Additional Info */}
            <div className="text-sm text-text-secondary space-y-2">
              <p>• Бесплатная доставка от 3000 ₽</p>
              <p>• Возврат в течение 14 дней</p>
              <p>• Оригинальность гарантирована</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;