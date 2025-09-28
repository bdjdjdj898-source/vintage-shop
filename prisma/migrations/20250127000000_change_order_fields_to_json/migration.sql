-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "shippingInfo" TYPE JSONB USING "shippingInfo"::JSONB,
ALTER COLUMN "telegramData" TYPE JSONB USING "telegramData"::JSONB;