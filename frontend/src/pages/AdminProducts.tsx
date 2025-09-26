import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Product, CreateProductData, UploadProgress, CloudinarySignature } from '../types/api';

const AdminProducts: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [newProduct, setNewProduct] = useState<CreateProductData>({
    title: '',
    brand: '',
    category: 'Куртки',
    size: '',
    color: '',
    condition: 8,
    description: '',
    price: 0,
    images: []
  });

  const categories = ['Куртки', 'Толстовки', 'Джинсы', 'Аксессуары', 'Обувь', 'Свитеры'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiFetch('/api/admin/products?limit=50');
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

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Недопустимый формат файла. Разрешены: JPG, PNG, WebP';
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'Размер файла не должен превышать 5 МБ';
    }

    return null;
  };

  const uploadToCloudinary = async (file: File, signatureData: CloudinarySignature): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signatureData.api_key);
    formData.append('timestamp', signatureData.timestamp.toString());
    formData.append('signature', signatureData.signature);
    formData.append('public_id', signatureData.public_id);
    formData.append('folder', signatureData.folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Ошибка загрузки в Cloudinary');
    }

    const result = await response.json();
    return result.secure_url;
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    const uploadPromises: Promise<void>[] = [];

    Array.from(files).forEach((file, index) => {
      const validationError = validateFile(file);
      if (validationError) {
        setUploadProgress(prev => [
          ...prev,
          {
            fileName: file.name,
            progress: 100,
            status: 'error',
            error: validationError
          }
        ]);
        return;
      }

      const uploadPromise = (async () => {
        try {
          // Add to upload progress
          setUploadProgress(prev => [
            ...prev,
            {
              fileName: file.name,
              progress: 0,
              status: 'uploading'
            }
          ]);

          // Get signature from backend
          const signResponse = await apiFetch('/api/admin/uploads/sign', {
            method: 'POST',
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
              size: file.size
            })
          });

          if (!signResponse.success) {
            throw new Error(signResponse.error || 'Ошибка получения подписи');
          }

          // Update progress
          setUploadProgress(prev => prev.map(p =>
            p.fileName === file.name
              ? { ...p, progress: 25 }
              : p
          ));

          // Upload to Cloudinary
          const imageUrl = await uploadToCloudinary(file, signResponse.data);

          // Update progress to completed
          setUploadProgress(prev => prev.map(p =>
            p.fileName === file.name
              ? { ...p, progress: 100, status: 'completed', url: imageUrl }
              : p
          ));

          // Add to images array
          setNewProduct(prev => ({
            ...prev,
            images: [...prev.images.filter(img => img.trim() !== ''), imageUrl]
          }));

        } catch (error: any) {
          console.error('Upload error:', error);
          setUploadProgress(prev => prev.map(p =>
            p.fileName === file.name
              ? { ...p, status: 'error', error: error.message }
              : p
          ));
        }
      })();

      uploadPromises.push(uploadPromise);
    });

    await Promise.all(uploadPromises);
    setIsUploading(false);

    // Clear upload progress after a delay
    setTimeout(() => {
      setUploadProgress([]);
    }, 3000);
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
          images: []
        });
        setUploadProgress([]);
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
                    onClick={() => {
                      setIsModalOpen(false);
                      setUploadProgress([]);
                      setCreateError(null);
                    }}
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
                        Изображения
                      </label>

                      {/* File Upload */}
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                            className="hidden"
                            id="file-upload"
                            disabled={isUploading}
                          />
                          <label
                            htmlFor="file-upload"
                            className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="space-y-2">
                              <div className="text-4xl text-gray-400">📷</div>
                              <div className="text-sm text-gray-600">
                                {isUploading ? 'Загрузка...' : 'Нажмите для выбора файлов или перетащите их сюда'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Поддерживаются: JPG, PNG, WebP (до 5 МБ каждый)
                              </div>
                            </div>
                          </label>
                        </div>

                        {/* Upload Progress */}
                        {uploadProgress.length > 0 && (
                          <div className="space-y-2">
                            {uploadProgress.map((upload, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-gray-700 truncate">
                                    {upload.fileName}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    upload.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : upload.status === 'error'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {upload.status === 'completed' ? 'Готово'
                                      : upload.status === 'error' ? 'Ошибка'
                                      : 'Загрузка...'}
                                  </span>
                                </div>
                                {upload.status === 'uploading' && (
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${upload.progress}%` }}
                                    ></div>
                                  </div>
                                )}
                                {upload.error && (
                                  <div className="text-red-600 text-xs mt-1">{upload.error}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Current Images */}
                        {newProduct.images.filter(img => img.trim()).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Загруженные изображения:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {newProduct.images
                                .filter(img => img.trim())
                                .map((image, index) => (
                                  <div key={index} className="relative group">
                                    <img
                                      src={image}
                                      alt={`Product ${index + 1}`}
                                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNewProduct(prev => ({
                                          ...prev,
                                          images: prev.images.filter(u => u.trim() && u !== image)
                                        }));
                                      }}
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Manual URL Input (fallback) */}
                        <details className="mt-4">
                          <summary className="text-sm text-gray-600 cursor-pointer hover:text-blue-600">
                            Добавить изображение по URL (дополнительно)
                          </summary>
                          <div className="mt-2 space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                    const url = e.currentTarget.value.trim();
                                    setNewProduct(prev => ({
                                      ...prev,
                                      images: [...prev.images.filter(img => img.trim()), url]
                                    }));
                                    e.currentTarget.value = '';
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>

                  {createError && (
                    <div className="text-red-600 text-sm">{createError}</div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setUploadProgress([]);
                        setCreateError(null);
                      }}
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