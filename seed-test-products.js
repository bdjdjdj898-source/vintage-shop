const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test products...');

  const products = [
    {
      title: 'Dr. Martens 1460',
      brand: 'Dr. Martens',
      category: 'Обувь',
      size: '42',
      color: 'Черный',
      condition: 9,
      description: 'Винтажные ботинки Dr. Martens 1460 в отличном состоянии',
      price: 11000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
        'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800',
        'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800'
      ]),
      isActive: true
    },
    {
      title: 'Supreme Box Logo',
      brand: 'Supreme',
      category: 'Толстовки',
      size: 'L',
      color: 'Белый',
      condition: 8,
      description: 'Винтажная футболка Supreme Box Logo в хорошем состоянии',
      price: 15000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800'
      ]),
      isActive: true
    },
    {
      title: 'Eastpak',
      brand: 'Eastpak',
      category: 'Аксессуары',
      size: 'OneSize',
      color: 'Синий',
      condition: 9,
      description: 'Винтажный рюкзак Eastpak в отличном состоянии',
      price: 4500,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800',
        'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=800',
        'https://images.unsplash.com/photo-1585916420730-d7f95e942d43?w=800'
      ]),
      isActive: true
    },
    {
      title: 'Carhartt Cap',
      brand: 'Carhartt',
      category: 'Аксессуары',
      size: 'OneSize',
      color: 'Белый',
      condition: 8,
      description: 'Винтажная кепка Carhartt в хорошем состоянии',
      price: 3200,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
        'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800',
        'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800',
        'https://images.unsplash.com/photo-1589965716558-96ac7ba42407?w=800'
      ]),
      isActive: true
    }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product
    });
    console.log(`✅ Created: ${product.name}`);
  }

  console.log('✅ Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
