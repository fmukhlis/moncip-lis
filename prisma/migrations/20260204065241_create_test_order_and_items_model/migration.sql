-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('LIS', 'HIS');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ORDERED', 'ACKNOWLEDGED', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('ROUTINE', 'URGENT');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('ORDERED', 'CANCELED', 'COMPLETED');

-- CreateTable
CREATE TABLE "TestOrder" (
    "id" TEXT NOT NULL,
    "notes" TEXT,
    "source" "OrderSource" NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "priority" "OrderPriority" NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "cancelReason" TEXT,
    "externalSystem" TEXT,
    "externalOrderId" TEXT,
    "patientId" TEXT NOT NULL,
    "orderedById" TEXT NOT NULL,
    "updatedById" TEXT,
    "canceledById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderedAt" TIMESTAMP(3) NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "sampleCollectedAt" TIMESTAMP(3),
    "inProgressAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),

    CONSTRAINT "TestOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestOrderItem" (
    "id" TEXT NOT NULL,
    "status" "OrderItemStatus" NOT NULL,
    "cancelReason" TEXT,
    "priceSnapshot" JSONB NOT NULL,
    "testOrderId" TEXT NOT NULL,
    "canceledById" TEXT,
    "laboratoriesOnLabTestsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceledAt" TIMESTAMP(3),

    CONSTRAINT "TestOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestOrder_orderNumber_key" ON "TestOrder"("orderNumber");

-- AddForeignKey
ALTER TABLE "TestOrder" ADD CONSTRAINT "TestOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestOrder" ADD CONSTRAINT "TestOrder_orderedById_fkey" FOREIGN KEY ("orderedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestOrder" ADD CONSTRAINT "TestOrder_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestOrder" ADD CONSTRAINT "TestOrder_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestOrderItem" ADD CONSTRAINT "TestOrderItem_testOrderId_fkey" FOREIGN KEY ("testOrderId") REFERENCES "TestOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestOrderItem" ADD CONSTRAINT "TestOrderItem_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestOrderItem" ADD CONSTRAINT "TestOrderItem_laboratoriesOnLabTestsId_fkey" FOREIGN KEY ("laboratoriesOnLabTestsId") REFERENCES "LaboratoriesOnLabTests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
