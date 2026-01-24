/*
  Warnings:

  - Added the required column `ageMaxUnit` to the `ReferenceRange` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ageMinUnit` to the `ReferenceRange` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AgeUnit" AS ENUM ('M', 'Y');

-- AlterTable
ALTER TABLE "ReferenceRange" ADD COLUMN     "ageMaxUnit" "AgeUnit" NOT NULL,
ADD COLUMN     "ageMinUnit" "AgeUnit" NOT NULL;
