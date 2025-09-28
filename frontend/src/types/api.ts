// Shared API types to prevent duplication and maintain consistency

export interface User {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: 'admin' | 'user';
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
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

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt: string;
  product: Product;
}

export interface Cart {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Ожидает', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Подтвержден', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Отправлен', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Доставлен', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Отменен', color: 'bg-red-100 text-red-800' }
};

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  shippingInfo: {
    name: string;
    phone: string;
    address: string;
    email?: string;
  };
  telegramData?: {
    telegramId: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

// Error codes from backend
export enum ErrorCode {
  // Authentication and authorization
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_INVALID = 'AUTH_INVALID',
  ACCESS_DENIED = 'ACCESS_DENIED',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Business logic
  CART_EMPTY = 'CART_EMPTY',
  PRODUCT_UNAVAILABLE = 'PRODUCT_UNAVAILABLE',
  ORDER_NOT_PROCESSABLE = 'ORDER_NOT_PROCESSABLE',

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

// Base response structure
interface BaseResponse {
  success: boolean;
  timestamp: string;
}

// Success response
export interface ApiResponse<T> extends BaseResponse {
  success: true;
  data: T;
}

// Error response
export interface ApiErrorResponse extends BaseResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
  };
}

// Paginated response
export interface PaginatedResponse<T> extends BaseResponse {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form/Input types
export interface CreateProductData {
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

export interface UpdateProductData extends Partial<CreateProductData> {
  isActive?: boolean;
}

export interface CreateOrderData {
  shippingInfo: {
    name: string;
    phone: string;
    address: string;
    email?: string;
  };
}

// Upload types
export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  public_id: string;
  api_key: string;
  cloud_name: string;
  folder: string;
  resource_type: string;
}