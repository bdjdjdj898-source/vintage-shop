const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('📸 Adding more photos to existing products...');

  // Get all products
  const products = await prisma.product.findMany();

  for (const product of products) {
    const currentImages = JSON.parse(product.images);

    // If product has less than 6 images, duplicate existing ones
    if (currentImages.length < 6) {
      const additionalImages = [];
      let imagesNeeded = 6 - currentImages.length;

      // Duplicate existing images
      while (imagesNeeded > 0) {
        for (const img of currentImages) {
          if (imagesNeeded === 0) break;
          additionalImages.push(img);
          imagesNeeded--;
        }
      }

      const newImages = [...currentImages, ...additionalImages];

      await prisma.product.update({
        where: { id: product.id },
        data: { images: JSON.stringify(newImages) }
      });

      console.log(`✅ Updated ${product.title}: ${currentImages.length} → ${newImages.length} photos`);
    } else {
      console.log(`ℹ️  ${product.title}: already has ${currentImages.length} photos`);
    }
  }

  console.log('✅ Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
