-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "OrderEventType" AS ENUM ('CREATED', 'CANCELLED');

-- CreateTable
CREATE TABLE "InboundOrderEvent" (
    "id" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL,
    "payload" JSONB NOT NULL,
    "eventType" "OrderEventType" NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "sourceSystem" TEXT NOT NULL,
    "errorMessage" TEXT,
    "targetUserIds" TEXT[],
    "externalOrderId" TEXT NOT NULL,
    "testOrderId" TEXT,

    CONSTRAINT "InboundOrderEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InboundOrderEvent" ADD CONSTRAINT "InboundOrderEvent_testOrderId_fkey" FOREIGN KEY ("testOrderId") REFERENCES "TestOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
