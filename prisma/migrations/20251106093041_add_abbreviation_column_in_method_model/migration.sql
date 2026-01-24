/*
  Warnings:

  - Added the required column `abbreviation` to the `Method` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Method" ADD COLUMN     "abbreviation" TEXT NOT NULL;
