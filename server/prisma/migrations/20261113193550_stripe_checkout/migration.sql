-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "stripeSessionId" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "shipFullName" DROP NOT NULL,
ALTER COLUMN "shipLine1" DROP NOT NULL,
ALTER COLUMN "shipCity" DROP NOT NULL,
ALTER COLUMN "shipPostcode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");
