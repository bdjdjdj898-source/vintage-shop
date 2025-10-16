import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Check if products already exist
  const existingProducts = await prisma.product.count();
  if (existingProducts > 0) {
    console.log(`✅ Database already has ${existingProducts} products. Skipping seed.`);
    return;
  }

  // Create demo products
  const products = [
    {
      title: 'Vintage Levi\'s 501 Jeans',
      brand: 'Levi\'s',
      category: 'Джинсы',
      size: 'M',
      color: 'Синий',
      condition: 9,
      description: 'Классические джинсы Levi\'s 501 в отличном состоянии. Винтажная модель 90-х годов.',
      price: 4500,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=1000&fit=crop'
      ]),
      isActive: true
    },
    {
      title: 'Винтажная кожаная куртка',
      brand: 'Schott',
      category: 'Верхняя одежда',
      size: 'L',
      color: 'Черный',
      condition: 8,
      description: 'Легендарная кожаная куртка Schott Perfecto. Натуральная кожа, идеальная патина.',
      price: 15000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&h=1000&fit=crop'
      ]),
      isActive: true
    },
    {
      title: 'Ретро футболка band tee',
      brand: 'Hanes',
      category: 'Футболки',
      size: 'M',
      color: 'Черный',
      condition: 7,
      description: 'Винтажная концертная футболка 80-х. Мягкий хлопок с винтажным принтом.',
      price: 2500,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop'
      ]),
      isActive: true
    },
    {
      title: 'Винтажные кроссовки Nike Air',
      brand: 'Nike',
      category: 'Обувь',
      size: '42',
      color: 'Белый/Красный',
      condition: 8,
      description: 'Классические Nike Air из коллекции 90-х. Отличное состояние, минимальный износ.',
      price: 8500,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=1000&fit=crop'
      ]),
      isActive: true
    },
    {
      title: 'Vintage Carhartt рабочая куртка',
      brand: 'Carhartt',
      category: 'Верхняя одежда',
      size: 'XL',
      color: 'Коричневый',
      condition: 9,
      description: 'Культовая рабочая куртка Carhartt. Прочный duck canvas, винтажная патина.',
      price: 6500,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1544923408-75c5cef46f14?w=800&h=1000&fit=crop'
      ]),
      isActive: true
    },
    {
      title: 'Ретро свитер с узором',
      brand: 'Ralph Lauren',
      category: 'Свитера',
      size: 'L',
      color: 'Бежевый',
      condition: 8,
      description: 'Винтажный шерстяной свитер Ralph Lauren с классическим узором. Теплый и стильный.',
      price: 4000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&fit=crop'
      ]),
      isActive: true
    },
    {
      title: 'Винтажная джинсовая куртка',
      brand: 'Wrangler',
      category: 'Верхняя одежда',
      size: 'M',
      color: 'Синий',
      condition: 9,
      description: 'Классическая джинсовая куртка Wrangler. Идеальная потертость, винтажный деним.',
      price: 5500,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=800&h=1000&fit=crop'
      ]),
      isActive: true
    },
    {
      title: 'Vintage Champion худи',
      brand: 'Champion',
      category: 'Толстовки',
      size: 'L',
      color: 'Серый',
      condition: 8,
      description: 'Легендарное худи Champion Reverse Weave. Плотный хлопок, винтажный крой.',
      price: 5000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&h=1000&fit=crop'
      ]),
      isActive: true
    },
    {
      title: 'Ретро ветровка 90-х',
      brand: 'Adidas',
      category: 'Верхняя одежда',
      size: 'L',
      color: 'Мультиколор',
      condition: 7,
      description: 'Яркая спортивная ветровка Adidas из 90-х. Классический streetwear стиль.',
      price: 3500,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1525450824786-227cbef70703?w=800&h=1000&fit=crop'
      ]),
      isActive: true
    },
    {
      title: 'Винтажная рубашка в клетку',
      brand: 'Pendleton',
      category: 'Рубашки',
      size: 'M',
      color: 'Красный/Черный',
      condition: 9,
      description: 'Классическая фланелевая рубашка Pendleton. 100% шерсть, вечная классика.',
      price: 6000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1000&fit=crop'
      ]),
      isActive: true
    }
  ];

  console.log('📦 Creating products...');

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  const count = await prisma.product.count();
  console.log(`✅ Seed completed! Created ${count} products.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
