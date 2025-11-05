import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Product, CreateProductData, UploadProgress, CloudinarySignature } from '../types/api';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useTelegramBackButton } from '../hooks/useTelegramUI';

// Cache outside component to persist across unmounts
let productsCache: Product[] | null = null;

const AdminProducts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(productsCache || []);
  const [isLoading, setIsLoading] = useState(!productsCache);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Telegram Back Button
  useTelegramBackButton(() => {
    localStorage.removeItem('lastAdminTab');
    navigate(-1);
  });

  const [newProduct, setNewProduct] = useState<CreateProductData>({
    title: '',
    brand: '',
    category: 'Куртки',
    size: '',
    color: '',
    condition: 8,
    description: '',
    price: 0,
    quantity: 1,
    discount: 0,
    images: []
  });

  const categories = ['Куртки', 'Толстовки', 'Джинсы', 'Аксессуары', 'Обувь', 'Свитеры'];

  // Local search filter - filters only loaded products
  const filteredProducts = products.filter(product => {
    if (!localSearchQuery.trim()) return true;

    const query = localSearchQuery.toLowerCase();
    return (
      product.title.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.color.toLowerCase().includes(query) ||
      product.size.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    // Only fetch if cache is empty
    if (!productsCache) {
      fetchProducts();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiFetch('/api/admin/products?limit=50');
      if (response.success) {
        productsCache = response.data; // Update cache
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
        // Update local state and cache
        const updatedProducts = products.map(product =>
          product.id === productId
            ? { ...product, isActive: !isActive }
            : product
        );
        setProducts(updatedProducts);
        productsCache = updatedProducts;
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
        // Update local state and cache
        const updatedProducts = products.map(product =>
          product.id === productId
            ? { ...product, isActive: false }
            : product
        );
        setProducts(updatedProducts);
        productsCache = updatedProducts;
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Ошибка удаления товара');
    }
  };

  const editProduct = (productId: number) => {
    // TODO: Implement edit modal
    alert(`Редактирование товара ${productId} будет добавлено в следующем обновлении`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'condition' || name === 'quantity' || name === 'discount' ? Number(value) : value
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
          quantity: 1,
          discount: 0,
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
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--text)',
            marginBottom: '0.5rem'
          }}>
            Доступ запрещен
          </h2>
          <p style={{
            color: 'var(--text-secondary)'
          }}>
            У вас нет прав для просмотра этой страницы
          </p>
        </div>
      </div>
    );
  }

  // Skeleton loader component
  const ProductSkeleton = () => (
    <div style={{
      background: 'var(--card)',
      borderRadius: '0.75rem',
      padding: '1rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid var(--border)'
    }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '0.5rem',
          background: 'linear-gradient(90deg, var(--border) 25%, #e0e0e0 50%, var(--border) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }} />
        <div style={{ flex: 1 }}>
          <div style={{
            height: '1rem',
            width: '70%',
            marginBottom: '0.5rem',
            borderRadius: '0.25rem',
            background: 'linear-gradient(90deg, var(--border) 25%, #e0e0e0 50%, var(--border) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }} />
          <div style={{
            height: '0.75rem',
            width: '50%',
            marginBottom: '0.5rem',
            borderRadius: '0.25rem',
            background: 'linear-gradient(90deg, var(--border) 25%, #e0e0e0 50%, var(--border) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }} />
          <div style={{
            height: '0.75rem',
            width: '60%',
            marginBottom: '0.5rem',
            borderRadius: '0.25rem',
            background: 'linear-gradient(90deg, var(--border) 25%, #e0e0e0 50%, var(--border) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }} />
        </div>
      </div>
      <div style={{
        height: '1.5rem',
        width: '30%',
        marginBottom: '0.75rem',
        borderRadius: '9999px',
        background: 'linear-gradient(90deg, var(--border) 25%, #e0e0e0 50%, var(--border) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
      }} />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1,
            height: '2.5rem',
            borderRadius: '0.5rem',
            background: 'linear-gradient(90deg, var(--border) 25%, #e0e0e0 50%, var(--border) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }} />
        ))}
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );

  if (isLoading && products.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        paddingBottom: '80px'
      }}>
        <Header hideSearch={true} />
        <div style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--text)'
            }}>
              Управление товарами
            </h1>
            <button
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none'
              }}
            >
              Добавить товар
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3, 4, 5].map(i => <ProductSkeleton key={i} />)}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)'
      }}>
        <Header hideSearch={true} />
        <div style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '16rem'
          }}>
            <div style={{
              fontSize: '1.125rem',
              color: '#ef4444'
            }}>
              {error}
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      paddingBottom: '80px'
    }}>
      <Header hideSearch={true} />
      <div style={{
        maxWidth: '640px',
        margin: '0 auto',
        padding: '1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'var(--text)'
          }}>
            Управление товарами
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
          >
            Добавить товар
          </button>
        </div>

        {/* Local search input */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Поиск по товарам"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--card)',
              color: 'var(--text)',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          />
          {localSearchQuery && (
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginTop: '0.5rem'
            }}>
              Найдено: {filteredProducts.length} из {products.length} товаров
            </div>
          )}
        </div>

        {/* Mobile card layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              style={{
                background: 'var(--card)',
                borderRadius: '0.75rem',
                padding: '1rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid var(--border)'
              }}
            >
              {/* Product info */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {product.images.length > 0 && (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '0.5rem',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text)',
                    marginBottom: '0.25rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {product.title}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem'
                  }}>
                    {product.brand} • {product.size} • {product.color}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem'
                  }}>
                    {product.category} • Состояние: {product.condition}/10
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: 'var(--text)'
                  }}>
                    {product.price.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{
                  display: 'inline-flex',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  borderRadius: '9999px',
                  background: product.isActive ? '#d1fae5' : '#fee2e2',
                  color: product.isActive ? '#065f46' : '#991b1b'
                }}>
                  {product.isActive ? 'Активен' : 'Неактивен'}
                </span>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => editProduct(product.id)}
                  style={{
                    flex: 1,
                    minWidth: '100px',
                    padding: '0.5rem 1rem',
                    background: '#dbeafe',
                    color: '#1e40af',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  Редактировать
                </button>
                <button
                  onClick={() => toggleProductStatus(product.id, product.isActive)}
                  style={{
                    flex: 1,
                    minWidth: '100px',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    background: product.isActive ? '#fef3c7' : '#d1fae5',
                    color: product.isActive ? '#92400e' : '#065f46',
                    transition: 'background 0.2s'
                  }}
                >
                  {product.isActive ? 'Скрыть' : 'Показать'}
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  style={{
                    flex: 1,
                    minWidth: '100px',
                    padding: '0.5rem 1rem',
                    background: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--text-secondary)'
            }}>
              Товары не найдены
            </div>
          )}
        </div>

        {/* Create Product Modal */}
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            inset: '0',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: '50'
          }}>
            <div style={{
              background: 'var(--card)',
              borderRadius: '0.5rem',
              maxWidth: '42rem',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div style={{ padding: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: 'var(--text)'
                  }}>
                    Добавить товар
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setUploadProgress([]);
                      setCreateError(null);
                    }}
                    style={{
                      color: 'var(--text-secondary)',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text)',
                        marginBottom: '0.25rem'
                      }}>
                        Название *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={newProduct.title}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          border: '1px solid var(--border)',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #3b82f6'}
                        onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text)',
                        marginBottom: '0.25rem'
                      }}>
                        Бренд *
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={newProduct.brand}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          border: '1px solid var(--border)',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #3b82f6'}
                        onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text)',
                        marginBottom: '0.25rem'
                      }}>
                        Категория *
                      </label>
                      <select
                        name="category"
                        value={newProduct.category}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          border: '1px solid var(--border)',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #3b82f6'}
                        onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text)',
                        marginBottom: '0.25rem'
                      }}>
                        Размер *
                      </label>
                      <input
                        type="text"
                        name="size"
                        value={newProduct.size}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          border: '1px solid var(--border)',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #3b82f6'}
                        onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text)',
                        marginBottom: '0.25rem'
                      }}>
                        Цвет *
                      </label>
                      <input
                        type="text"
                        name="color"
                        value={newProduct.color}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          border: '1px solid var(--border)',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #3b82f6'}
                        onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text)',
                        marginBottom: '0.25rem'
                      }}>
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
                        style={{
                          width: '100%',
                          border: '1px solid var(--border)',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #3b82f6'}
                        onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text)',
                        marginBottom: '0.25rem'
                      }}>
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
                        style={{
                          width: '100%',
                          border: '1px solid var(--border)',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #3b82f6'}
                        onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text)',
                        marginBottom: '0.25rem'
                      }}>
                        Количество *
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={newProduct.quantity}
                        onChange={handleInputChange}
                        min="0"
                        step="1"
                        required
                        style={{
                          width: '100%',
                          border: '1px solid var(--border)',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #3b82f6'}
                        onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text)',
                        marginBottom: '0.25rem'
                      }}>
                        Скидка (%) *
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={newProduct.discount}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        step="1"
                        required
                        style={{
                          width: '100%',
                          border: '1px solid var(--border)',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #3b82f6'}
                        onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text)',
                        marginBottom: '0.25rem'
                      }}>
                        Описание *
                      </label>
                      <textarea
                        name="description"
                        value={newProduct.description}
                        onChange={handleInputChange}
                        rows={3}
                        required
                        style={{
                          width: '100%',
                          border: '1px solid var(--border)',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                        onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #3b82f6'}
                        onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text)',
                        marginBottom: '0.25rem'
                      }}>
                        Изображения
                      </label>

                      {/* File Upload */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{
                          border: '2px dashed var(--border)',
                          borderRadius: '0.5rem',
                          padding: '1.5rem',
                          textAlign: 'center',
                          transition: 'border-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isUploading) {
                            e.currentTarget.style.borderColor = '#3b82f6';
                          }
                        }}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                          <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                            style={{ display: 'none' }}
                            id="file-upload"
                            disabled={isUploading}
                          />
                          <label
                            htmlFor="file-upload"
                            style={{
                              cursor: isUploading ? 'not-allowed' : 'pointer',
                              opacity: isUploading ? '0.5' : '1'
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <div style={{ fontSize: '2.25rem' }}>📷</div>
                              <div style={{
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)'
                              }}>
                                {isUploading ? 'Загрузка...' : 'Нажмите для выбора файлов или перетащите их сюда'}
                              </div>
                              <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)'
                              }}>
                                Поддерживаются: JPG, PNG, WebP (до 5 МБ каждый)
                              </div>
                            </div>
                          </label>
                        </div>

                        {/* Upload Progress */}
                        {uploadProgress.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {uploadProgress.map((upload, index) => (
                              <div key={index} style={{
                                background: 'var(--bg)',
                                borderRadius: '0.5rem',
                                padding: '0.75rem'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '0.5rem'
                                }}>
                                  <span style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'var(--text)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {upload.fileName}
                                  </span>
                                  <span style={{
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '9999px',
                                    background: upload.status === 'completed'
                                      ? '#d1fae5'
                                      : upload.status === 'error'
                                      ? '#fee2e2'
                                      : '#dbeafe',
                                    color: upload.status === 'completed'
                                      ? '#065f46'
                                      : upload.status === 'error'
                                      ? '#991b1b'
                                      : '#1e40af'
                                  }}>
                                    {upload.status === 'completed' ? 'Готово'
                                      : upload.status === 'error' ? 'Ошибка'
                                      : 'Загрузка...'}
                                  </span>
                                </div>
                                {upload.status === 'uploading' && (
                                  <div style={{
                                    width: '100%',
                                    background: '#e5e7eb',
                                    borderRadius: '9999px',
                                    height: '0.5rem'
                                  }}>
                                    <div
                                      style={{
                                        background: '#3b82f6',
                                        height: '0.5rem',
                                        borderRadius: '9999px',
                                        transition: 'width 0.3s',
                                        width: `${upload.progress}%`
                                      }}
                                    ></div>
                                  </div>
                                )}
                                {upload.error && (
                                  <div style={{
                                    color: '#ef4444',
                                    fontSize: '0.75rem',
                                    marginTop: '0.25rem'
                                  }}>
                                    {upload.error}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Current Images */}
                        {newProduct.images.filter(img => img.trim()).length > 0 && (
                          <div>
                            <h4 style={{
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: 'var(--text)',
                              marginBottom: '0.5rem'
                            }}>
                              Загруженные изображения:
                            </h4>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                              gap: '0.75rem'
                            }}>
                              {newProduct.images
                                .filter(img => img.trim())
                                .map((image, index) => (
                                  <div key={index} style={{
                                    position: 'relative'
                                  }}>
                                    <img
                                      src={image}
                                      alt={`Product ${index + 1}`}
                                      style={{
                                        width: '100%',
                                        height: '6rem',
                                        objectFit: 'cover',
                                        borderRadius: '0.5rem',
                                        border: '1px solid var(--border)'
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNewProduct(prev => ({
                                          ...prev,
                                          images: prev.images.filter(u => u.trim() && u !== image)
                                        }));
                                      }}
                                      style={{
                                        position: 'absolute',
                                        top: '0.25rem',
                                        right: '0.25rem',
                                        background: '#ef4444',
                                        color: 'white',
                                        borderRadius: '9999px',
                                        width: '1.5rem',
                                        height: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        opacity: '0',
                                        transition: 'opacity 0.2s'
                                      }}
                                      onMouseEnter={(e) => {
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                          const btn = parent.querySelector('button');
                                          if (btn instanceof HTMLElement) {
                                            btn.style.opacity = '1';
                                          }
                                        }
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Manual URL Input (fallback) */}
                        <details style={{ marginTop: '1rem' }}>
                          <summary style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                          >
                            Добавить изображение по URL (дополнительно)
                          </summary>
                          <div style={{
                            marginTop: '0.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                          }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                style={{
                                  flex: '1',
                                  border: '1px solid var(--border)',
                                  borderRadius: '0.5rem',
                                  padding: '0.5rem 0.75rem',
                                  background: 'var(--bg)',
                                  color: 'var(--text)',
                                  outline: 'none'
                                }}
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
                                onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #3b82f6'}
                                onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                              />
                            </div>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>

                  {createError && (
                    <div style={{
                      color: '#ef4444',
                      fontSize: '0.875rem'
                    }}>
                      {createError}
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.75rem',
                    paddingTop: '1rem'
                  }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setUploadProgress([]);
                        setCreateError(null);
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                        background: 'transparent',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: isCreating ? 'not-allowed' : 'pointer',
                        opacity: isCreating ? '0.5' : '1',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isCreating) {
                          e.currentTarget.style.background = '#2563eb';
                        }
                      }}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
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
      <BottomNavigation />
    </div>
  );
};

export default AdminProducts;
