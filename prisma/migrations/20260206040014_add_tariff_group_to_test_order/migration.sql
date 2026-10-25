/*
  Warnings:

  - Added the required column `tariffGroupId` to the `TestOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TestOrder" ADD COLUMN     "tariffGroupId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TestOrder" ADD CONSTRAINT "TestOrder_tariffGroupId_fkey" FOREIGN KEY ("tariffGroupId") REFERENCES "TariffGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
