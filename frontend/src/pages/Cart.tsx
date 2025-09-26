import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { ApiError } from '../api/client';

const Cart: React.FC = () => {
  const { user } = useAuth();
  const { cart, isLoading, error, removeItem, updateQuantity, getTotalAmount } = useCart();
  const [unavailableProducts, setUnavailableProducts] = useState<number[]>([]);
  const [quantityError, setQuantityError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Загрузка корзины...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItem(itemId);
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    try {
      setQuantityError(null);
      await updateQuantity(itemId, quantity);
    } catch (err: any) {
      console.error('Error updating quantity:', err);

      // Handle typed ApiError
      if (err instanceof ApiError) {
        if (err.code === 'PRODUCT_UNAVAILABLE') {
          const item = cart?.items.find(item => item.id === itemId);
          if (item) {
            setUnavailableProducts(prev => [...prev, item.product.id]);
            setQuantityError('Некоторые товары в корзине больше недоступны');
          }
        } else {
          setQuantityError(err.message);
        }
      } else {
        const errorMessage = err.message || 'Произошла ошибка при обновлении количества';
        setQuantityError(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Корзина</h1>

        {/* Error Banner */}
        {quantityError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex">
              <div className="flex-1">
                <p>{quantityError}</p>
                {unavailableProducts.length > 0 && (
                  <p className="text-sm mt-1">
                    Товары, которые больше недоступны, помечены серым цветом.
                  </p>
                )}
              </div>
              <button
                onClick={() => setQuantityError(null)}
                className="ml-4 text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">Ваша корзина пуста</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Перейти к покупкам
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.items.map((item) => {
              const isUnavailable = !item.product.isActive || unavailableProducts.includes(item.product.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-lg shadow p-6 ${isUnavailable ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center space-x-4">
                    {item.product.images.length > 0 && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className={`w-20 h-20 object-cover rounded-lg ${isUnavailable ? 'grayscale' : ''}`}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${isUnavailable ? 'text-gray-500' : 'text-gray-800'}`}>
                        {item.product.title}
                        {isUnavailable && (
                          <span className="ml-2 text-sm text-red-600 font-normal">
                            (Недоступен)
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600">
                        {item.product.brand} • {item.product.size} • {item.product.color}
                      </p>
                      <p className={`text-lg font-bold ${isUnavailable ? 'text-gray-500' : 'text-gray-900'}`}>
                        {item.product.price.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUnavailable}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={isUnavailable}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 px-3 py-1 rounded"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Итого:</span>
                <span>{getTotalAmount().toLocaleString('ru-RU')} ₽</span>
              </div>
              <Link
                to="/checkout"
                className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors text-center block"
              >
                Оформить заказ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;