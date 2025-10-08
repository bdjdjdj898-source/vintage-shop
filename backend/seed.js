const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const products = [
  {
    title: "Vintage Coach Сумка",
    brand: "Coach",
    category: "Аксессуары",
    size: "One Size",
    color: "Navy Blue",
    condition: 9,
    description: "Классическая винтажная сумка Coach в отличном состоянии. Натуральная кожа.",
    price: 8500,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop"
    ]),
    isActive: true
  },
  {
    title: "Cashmere Свитер Uniqlo",
    brand: "Uniqlo",
    category: "Свитеры",
    size: "M",
    color: "White",
    condition: 8,
    description: "Кашемировый свитер Uniqlo, мягкий и теплый. Минимальные следы носки.",
    price: 3500,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop"
    ]),
    isActive: true
  },
  {
    title: "Nike Air Jordan 1",
    brand: "Nike",
    category: "Обувь",
    size: "42",
    color: "Red/White",
    condition: 7,
    description: "Легендарные кроссовки Nike Air Jordan 1. Винтажная пара с характером.",
    price: 12000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=1000&fit=crop"
    ]),
    isActive: true
  },
  {
    title: "Supreme Box Logo Толстовка",
    brand: "Supreme",
    category: "Толстовки",
    size: "L",
    color: "Grey",
    condition: 8,
    description: "Классическая толстовка Supreme Box Logo. Редкая модель.",
    price: 25000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop"
    ]),
    isActive: true
  },
  {
    title: "Levi's 501 Винтаж",
    brand: "Levi's",
    category: "Джинсы",
    size: "32/34",
    color: "Blue",
    condition: 9,
    description: "Винтажные джинсы Levi's 501 из 90-х. Идеальная посадка.",
    price: 6500,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1542272454315-7f6fabf51f16?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&h=1000&fit=crop"
    ]),
    isActive: true
  },
  {
    title: "Vintage Кожаная Куртка Schott",
    brand: "Schott",
    category: "Куртки",
    size: "L",
    color: "Black",
    condition: 8,
    description: "Винтажная кожаная куртка Schott Perfecto. Культовая модель, натуральная кожа.",
    price: 18000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&h=1000&fit=crop"
    ]),
    isActive: true
  },
  {
    title: "Розовая Детская Куртка Nike",
    brand: "Nike",
    category: "Куртки",
    size: "Kids 10-12",
    color: "Pink",
    condition: 9,
    description: "Яркая детская куртка Nike в отличном состоянии. Теплая и стильная.",
    price: 4500,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1606484543450-e6c7ed8d6bed?w=800&h=1000&fit=crop"
    ]),
    isActive: true
  }
];

async function seed() {
  console.log('Starting seed...');

  for (const product of products) {
    try {
      const created = await prisma.product.create({
        data: product
      });
      console.log(`✅ Created: ${created.title}`);
    } catch (error) {
      console.error(`❌ Error creating ${product.title}:`, error.message);
    }
  }

  console.log('✅ Seed completed!');
  await prisma.$disconnect();
}

seed().catch(console.error);
