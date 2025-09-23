import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

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

interface CreateProductData {
  title: string;
  brand: string;
  category: string;
  size: string;
  color: string;
  condition: number;
  description: string;
  price: number;
  images: string[];
}

const AdminProducts: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState<CreateProductData>({
    title: '',
    brand: '',
    category: 'Куртки',
    size: '',
    color: '',
    condition: 8,
    description: '',
    price: 0,
    images: ['']
  });

  const categories = ['Куртки', 'Толстовки', 'Джинсы', 'Аксессуары', 'Обувь', 'Свитеры'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiFetch('/api/products?limit=50');
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

  const toggleProductStatus = async (productId: number, isActive: boolean) => {
    try {
      const response = await apiFetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.success) {
        // Update local state
        setProducts(prev => prev.map(product =>
          product.id === productId
            ? { ...product, isActive: !isActive }
            : product
        ));
      }
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Ошибка обновления товара');
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      const response = await apiFetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        // Update local state
        setProducts(prev => prev.map(product =>
          product.id === productId
            ? { ...product, isActive: false }
            : product
        ));
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Ошибка удаления товара');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'condition' ? Number(value) : value
    }));
  };

  const handleImageChange = (index: number, value: string) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  const addImageField = () => {
    setNewProduct(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);

    try {
      // Filter out empty image URLs
      const filteredImages = newProduct.images.filter(url => url.trim() !== '');

      const response = await apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          ...newProduct,
          images: filteredImages
        })
      });

      if (response.success) {
        // Refresh product list
        await fetchProducts();
        // Reset form and close modal
        setNewProduct({
          title: '',
          brand: '',
          category: 'Куртки',
          size: '',
          color: '',
          condition: 8,
          description: '',
          price: 0,
          images: ['']
        });
        setIsModalOpen(false);
      }
    } catch (err: any) {
      console.error('Error creating product:', err);
      setCreateError('Ошибка создания товара. Проверьте все поля.');
    } finally {
      setIsCreating(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Доступ запрещен</h2>
          <p className="text-gray-600">У вас нет прав для просмотра этой страницы</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Загрузка товаров...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Управление товарами</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Добавить товар
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Товар
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цена
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Состояние
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.images.length > 0 && (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.brand} • {product.size} • {product.color}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.condition}/10</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => toggleProductStatus(product.id, product.isActive)}
                        className={`px-3 py-1 rounded text-xs ${
                          product.isActive
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {product.isActive ? 'Скрыть' : 'Показать'}
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-xs"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Товары не найдены
            </div>
          )}
        </div>

        {/* Create Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Добавить товар</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Название *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={newProduct.title}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Бренд *
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={newProduct.brand}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Категория *
                      </label>
                      <select
                        name="category"
                        value={newProduct.category}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Размер *
                      </label>
                      <input
                        type="text"
                        name="size"
                        value={newProduct.size}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Цвет *
                      </label>
                      <input
                        type="text"
                        name="color"
                        value={newProduct.color}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Состояние (1-10) *
                      </label>
                      <input
                        type="number"
                        name="condition"
                        value={newProduct.condition}
                        onChange={handleInputChange}
                        min="1"
                        max="10"
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Цена (₽) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={newProduct.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Описание *
                      </label>
                      <textarea
                        name="description"
                        value={newProduct.description}
                        onChange={handleInputChange}
                        rows={3}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Изображения (URL)
                      </label>
                      <div className="space-y-2">
                        {newProduct.images.map((image, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="url"
                              value={image}
                              onChange={(e) => handleImageChange(index, e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {newProduct.images.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeImageField(index)}
                                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                              >
                                Удалить
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addImageField}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          + Добавить изображение
                        </button>
                      </div>
                    </div>
                  </div>

                  {createError && (
                    <div className="text-red-600 text-sm">{createError}</div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isCreating ? 'Создание...' : 'Создать товар'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;