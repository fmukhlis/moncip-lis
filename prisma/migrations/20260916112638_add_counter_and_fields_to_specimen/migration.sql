/*
  Warnings:

  - Added the required column `no` to the `Specimen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `period` to the `Specimen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sequence` to the `Specimen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Specimen" ADD COLUMN     "no" TEXT NOT NULL,
ADD COLUMN     "period" TEXT NOT NULL,
ADD COLUMN     "sequence" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "SpecimenCounter" (
    "period" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecimenCounter_pkey" PRIMARY KEY ("period")
);
