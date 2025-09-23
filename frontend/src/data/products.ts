// Правильный тип Product с ВСЕМИ полями из PRD
export type Product = {
  id: number;
  title: string;
  price: number;
  images: string[]; // Массив изображений (НЕ image!)
  brand: string;
  category: string;
  size: string;
  color: string;
  condition: number; // 1-10
  description: string;
};

// Моки с рабочими CDN изображениями и полными данными
export const products: Product[] = [
  {
    id: 1,
    title: "Balenciaga Jacket",
    price: 2500,
    images: [
      "https://images.unsplash.com/photo-1544966503-7cc69c217e3e?w=400&h=500&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop&auto=format"
    ],
    brand: "Balenciaga",
    category: "Куртки",
    size: "L",
    color: "Black",
    condition: 9,
    description: "Винтажная куртка Balenciaga в превосходном состоянии."
  },
  {
    id: 2,
    title: "Stone Island Hoodie", 
    price: 1800,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&auto=format"
    ],
    brand: "Stone Island",
    category: "Толстовки",
    size: "M", 
    color: "Gray",
    condition: 8,
    description: "Худи Stone Island отличного состояния с фирменной нашивкой."
  },
  {
    id: 3,
    title: "Vintage Levi's 501",
    price: 2200,
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop&auto=format"
    ],
    brand: "Levi's",
    category: "Джинсы",
    size: "32/34",
    color: "Indigo",
    condition: 9,
    description: "Классические джинсы Levi's 501 в отличном состоянии."
  },
  {
    id: 4,
    title: "Coach Vintage Bag",
    price: 3200,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop&auto=format"
    ],
    brand: "Coach",
    category: "Аксессуары", 
    size: "Medium",
    color: "Brown",
    condition: 8,
    description: "Винтажная кожаная сумка Coach высокого качества."
  },
  {
    id: 5,
    title: "Nike Air Force 1 Vintage",
    price: 4500,
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop&auto=format"
    ],
    brand: "Nike",
    category: "Обувь",
    size: "42",
    color: "White/Red",
    condition: 6,
    description: "Винтажные кроссовки Nike Air Force 1 с историей."
  },
  {
    id: 6,
    title: "Ralph Lauren Wool Sweater",
    price: 1900,
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop&auto=format"
    ],
    brand: "Ralph Lauren",
    category: "Свитеры",
    size: "XL", 
    color: "Green",
    condition: 8,
    description: "Шерстяной свитер Ralph Lauren классического кроя."
  }
];