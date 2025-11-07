/*
  Warnings:

  - Added the required column `abbreviation` to the `Specimen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Specimen" ADD COLUMN     "abbreviation" TEXT NOT NULL;
