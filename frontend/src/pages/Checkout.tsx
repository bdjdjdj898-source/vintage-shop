import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { apiFetch } from '../api/client';
import { useNavigate } from 'react-router-dom';

interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  email?: string;
}

const Checkout: React.FC = () => {
  const { user, telegramUser } = useAuth();
  const { cart, getTotalAmount, getCart } = useCart();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: telegramUser?.first_name && telegramUser?.last_name
      ? `${telegramUser.first_name} ${telegramUser.last_name}`
      : telegramUser?.first_name || '',
    phone: '',
    address: '',
    email: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cart || cart.items.length === 0) {
      setError('Корзина пуста');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          shippingInfo
        })
      });

      if (response.success) {
        // Order created successfully
        await getCart(); // Refresh cart (should be empty now)
        navigate('/orders'); // Redirect to orders page
      }
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError('Ошибка при создании заказа. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Оформление заказа</h1>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">Ваша корзина пуста</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Перейти к покупкам
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Оформление заказа</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Информация для доставки</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Имя получателя *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={shippingInfo.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleInputChange}
                  placeholder="+7 (___) ___-__-__"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Адрес доставки *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  rows={3}
                  required
                  placeholder="Укажите полный адрес с городом, улицей, домом и квартирой"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email (необязательно)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={shippingInfo.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Создание заказа...' : 'Оформить заказ'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>

            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.title}</p>
                    <p className="text-sm text-gray-600">
                      {item.product.brand} • {item.quantity} шт.
                    </p>
                  </div>
                  <p className="font-medium">
                    {(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Итого:</span>
                <span>{getTotalAmount().toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;