import React from 'react';
import { formatCurrency } from '../utils/format';
import type { Product } from '../types/api';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const conditionText = (condition: number) => {
    if (condition >= 9) return 'Отличное';
    if (condition >= 7) return 'Хорошее';
    if (condition >= 5) return 'Удовлетв.';
    return 'Требует внимания';
  };

  const conditionColor = (condition: number) => {
    if (condition >= 9) return 'bg-green-100 text-green-800';
    if (condition >= 7) return 'bg-yellow-100 text-yellow-800';
    if (condition >= 5) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-lg"
      onClick={() => onClick?.(product)}
    >
      {/* Product Image */}
      <div className="relative h-64 bg-gray-200">
        <img
          src={product.images[0]} // Используем images[0], а не image
          alt={product.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback image если основное изображение не загрузится
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop&auto=format';
          }}
        />
        {/* Condition Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${conditionColor(product.condition)}`}>
          {conditionText(product.condition)}
        </div>
        {/* Multiple Images Indicator */}
        {product.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            +{product.images.length - 1}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand and Category */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-blue-600">{product.brand}</span>
          <span className="text-xs text-gray-500">{product.category}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>

        {/* Size and Color */}
        <div className="flex gap-2 mb-3">
          <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
            {product.size}
          </span>
          <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
            {product.color}
          </span>
        </div>

        {/* Price - Using formatCurrency for proper RUB formatting */}
        <div className="flex justify-between items-center">
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(product.price)}
          </p>
          <div className="text-xs text-gray-500">
            Состояние: {product.condition}/10
          </div>
        </div>

        {/* Description Preview */}
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {product.description}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;