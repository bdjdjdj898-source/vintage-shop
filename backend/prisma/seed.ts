import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create an admin user (only if not exists)
  const adminTelegramId = process.env.ADMIN_TELEGRAM_IDS?.split(',')[0]?.trim();

  if (adminTelegramId) {
    const adminUser = await prisma.user.upsert({
      where: { telegramId: adminTelegramId },
      update: {
        role: 'admin'
      },
      create: {
        telegramId: adminTelegramId,
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      }
    });
    console.log('✅ Admin user created/updated:', adminUser.telegramId);
  } else {
    console.log('⚠️  No ADMIN_TELEGRAM_IDS found in environment, skipping admin user creation');
  }

  // Sample products
  const sampleProducts = [
    {
      title: 'Vintage Levi\'s 501 Jeans',
      brand: 'Levi\'s',
      category: 'Джинсы',
      size: '32/32',
      color: 'Синий',
      condition: 8,
      description: 'Классические джинсы Levi\'s 501 в отличном состоянии. Винтажная модель 90-х годов.',
      price: 4500.00,
      images: [
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500',
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'
      ],
      isActive: true
    },
    {
      title: 'Stone Island Куртка',
      brand: 'Stone Island',
      category: 'Куртки',
      size: 'L',
      color: 'Черный',
      condition: 9,
      description: 'Оригинальная куртка Stone Island. Редкая модель с съемным капюшоном.',
      price: 25000.00,
      images: [
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500'
      ],
      isActive: true
    },
    {
      title: 'Supreme Box Logo Толстовка',
      brand: 'Supreme',
      category: 'Толстовки',
      size: 'M',
      color: 'Красный',
      condition: 7,
      description: 'Культовая толстовка Supreme с классическим Box Logo. Сезон FW20.',
      price: 15000.00,
      images: [
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'
      ],
      isActive: true
    },
    {
      title: 'Nike Air Jordan 1 Retro High',
      brand: 'Nike',
      category: 'Обувь',
      size: '42',
      color: 'Белый/Красный',
      condition: 6,
      description: 'Легендарные кроссовки Air Jordan 1 в классической расцветке Chicago.',
      price: 12000.00,
      images: [
        'https://images.unsplash.com/photo-1540479859555-17af45c78602?w=500'
      ],
      isActive: true
    },
    {
      title: 'Cashmere Свитер Uniqlo',
      brand: 'Uniqlo',
      category: 'Свитеры',
      size: 'S',
      color: 'Бежевый',
      condition: 9,
      description: 'Мягкий кашемировый свитер высокого качества. Практически новый.',
      price: 3500.00,
      images: [
        'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=500'
      ],
      isActive: true
    },
    {
      title: 'Vintage Coach Сумка',
      brand: 'Coach',
      category: 'Аксессуары',
      size: 'One Size',
      color: 'Коричневый',
      condition: 8,
      description: 'Винтажная кожаная сумка Coach. Натуральная кожа, отличное состояние.',
      price: 8500.00,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'
      ],
      isActive: true
    }
  ];

  // Create sample products
  for (const productData of sampleProducts) {
    const product = await prisma.product.upsert({
      where: {
        id: 0 // Will never match, so always creates
      },
      update: {},
      create: {
        ...productData,
        images: JSON.stringify(productData.images)
      }
    });
    console.log('✅ Product created/updated:', product.title);
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });