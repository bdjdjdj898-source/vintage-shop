import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  {
    title: 'Винтажная джинсовая куртка Levi\'s',
    brand: 'Levi\'s',
    category: 'Куртки',
    size: 'L',
    color: 'Синий',
    condition: 9,
    description: 'Классическая джинсовая куртка Levi\'s в отличном состоянии. Винтажная модель 80-х годов.',
    price: 8500,
    quantity: 1,
    discount: null,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800',
      'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800',
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
      'https://images.unsplash.com/photo-1548883354-1a94f1c3d1e4?w=800',
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
      'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800',
      'https://images.unsplash.com/photo-1548883354-1a94f1c3d1e4?w=800'
    ])
  },
  {
    title: 'Ретро толстовка Champion',
    brand: 'Champion',
    category: 'Толстовки',
    size: 'M',
    color: 'Серый',
    condition: 8,
    description: 'Уютная толстовка Champion 90-х годов. Мягкая ткань, минимальные следы носки.',
    price: 5200,
    quantity: 2,
    discount: 10,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800'
    ])
  },
  {
    title: 'Винтажные джинсы Wrangler',
    brand: 'Wrangler',
    category: 'Джинсы',
    size: '32/34',
    color: 'Синий',
    condition: 7,
    description: 'Классические прямые джинсы Wrangler. Аутентичная винтажная вещь с характерными потёртостями.',
    price: 4800,
    quantity: 1,
    discount: null,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800'
    ])
  },
  {
    title: 'Кожаная сумка через плечо',
    brand: 'Vintage',
    category: 'Аксессуары',
    size: 'One Size',
    color: 'Коричневый',
    condition: 6,
    description: 'Натуральная кожаная сумка ручной работы. Патина придаёт особый характер.',
    price: 6900,
    quantity: 1,
    discount: 15,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800'
    ])
  },
  {
    title: 'Кроссовки Nike Air Max 97',
    brand: 'Nike',
    category: 'Обувь',
    size: '42',
    color: 'Серебристый',
    condition: 8,
    description: 'Легендарные Nike Air Max 97 в редком цвете. Отличное состояние для винтажной обуви.',
    price: 12000,
    quantity: 1,
    discount: null,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800'
    ])
  },
  {
    title: 'Шерстяной свитер Ralph Lauren',
    brand: 'Ralph Lauren',
    category: 'Свитеры',
    size: 'XL',
    color: 'Зелёный',
    condition: 9,
    description: 'Тёплый шерстяной свитер Ralph Lauren. Практически новое состояние.',
    price: 7200,
    quantity: 1,
    discount: null,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800'
    ])
  },
  {
    title: 'Бомбер Alpha Industries',
    brand: 'Alpha Industries',
    category: 'Куртки',
    size: 'L',
    color: 'Чёрный',
    condition: 8,
    description: 'Культовый бомбер MA-1 от Alpha Industries. Классика милитари стиля.',
    price: 9800,
    quantity: 1,
    discount: 20,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800',
      'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800',
      'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800',
      'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800',
      'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800'
    ])
  },
  {
    title: 'Худи Carhartt WIP',
    brand: 'Carhartt',
    category: 'Толстовки',
    size: 'L',
    color: 'Бежевый',
    condition: 7,
    description: 'Стильная толстовка с капюшоном от Carhartt WIP. Комфортная носка.',
    price: 5800,
    quantity: 2,
    discount: null,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800'
    ])
  },
  {
    title: 'Джинсы Diesel прямого кроя',
    brand: 'Diesel',
    category: 'Джинсы',
    size: '31/32',
    color: 'Чёрный',
    condition: 8,
    description: 'Качественные чёрные джинсы Diesel. Прямой крой, удобная посадка.',
    price: 5500,
    quantity: 1,
    discount: null,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800'
    ])
  },
  {
    title: 'Кепка Stussy',
    brand: 'Stussy',
    category: 'Аксессуары',
    size: 'One Size',
    color: 'Чёрный',
    condition: 9,
    description: 'Классическая кепка Stussy с вышитым логотипом. Отличное состояние.',
    price: 3200,
    quantity: 3,
    discount: null,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800'
    ])
  }
];

async function seed() {
  console.log('🌱 Starting products seed...');

  try {
    // Удаляем старые товары если они есть
    const existingCount = await prisma.product.count();
    console.log(`📦 Found ${existingCount} existing products`);

    // Создаём товары
    for (const product of products) {
      await prisma.product.create({
        data: product
      });
      console.log(`✅ Created: ${product.title}`);
    }

    console.log(`\n🎉 Successfully seeded ${products.length} products!`);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
