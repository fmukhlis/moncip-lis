/*
  Warnings:

  - Added the required column `abbreviation` to the `Scale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Scale" ADD COLUMN     "abbreviation" TEXT NOT NULL;
