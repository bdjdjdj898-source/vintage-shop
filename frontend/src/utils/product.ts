import { Product } from '../types/api';

// Функция для расчета цены со скидкой
export function getDiscountedPrice(product: Product): number {
  if (product.discount && product.discount > 0) {
    return Math.round(product.price * (1 - product.discount / 100));
  }
  return product.price;
}

// Функция для проверки наличия скидки
export function hasDiscount(product: Product): boolean {
  return !!product.discount && product.discount > 0;
}

// Функция для проверки наличия на складе
export function isInStock(product: Product): boolean {
  return product.quantity > 0;
}

// Функция для получения цены для заказа (с учётом скидки)
export function getOrderPrice(product: Product): number {
  return hasDiscount(product) ? getDiscountedPrice(product) : product.price;
}
