/*
  Warnings:

  - Added the required column `displayCode` to the `Unit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "displayCode" TEXT NOT NULL;
