-- CreateTable
CREATE TABLE "MerchOrder" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "size" TEXT,
    "color" TEXT,
    "customerName" TEXT NOT NULL,
    "customerAddress" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MerchOrder" ADD CONSTRAINT "MerchOrder_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MerchItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
