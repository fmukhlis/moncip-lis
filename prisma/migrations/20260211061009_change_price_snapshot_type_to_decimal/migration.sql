/*
  Warnings:

  - Changed the type of `priceSnapshot` on the `TestOrderItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TestOrderItem" DROP COLUMN "priceSnapshot",
ADD COLUMN     "priceSnapshot" DECIMAL(65,30) NOT NULL;
