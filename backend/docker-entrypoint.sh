#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma db push --schema=../prisma/schema.prisma --accept-data-loss

echo "🌱 Seeding products if database is empty..."
npm run seed:products || echo "⚠️  Seed failed, continuing..."

echo "🚀 Starting server..."
exec npm start
