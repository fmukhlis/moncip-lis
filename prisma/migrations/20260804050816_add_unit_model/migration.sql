/*
  Warnings:

  - You are about to drop the column `unitCode` on the `LisResultComponent` table. All the data in the column will be lost.
  - You are about to drop the column `unitDisplay` on the `LisResultComponent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LisResultComponent" DROP COLUMN "unitCode",
DROP COLUMN "unitDisplay",
ADD COLUMN     "unitId" TEXT;

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Unit_code_key" ON "Unit"("code");

-- AddForeignKey
ALTER TABLE "LisResultComponent" ADD CONSTRAINT "LisResultComponent_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
