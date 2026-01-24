/*
  Warnings:

  - You are about to drop the column `resultType` on the `LabTest` table. All the data in the column will be lost.
  - Added the required column `scaleId` to the `LabTest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LabTest" DROP COLUMN "resultType",
ADD COLUMN     "scaleId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "ResultType";

-- CreateTable
CREATE TABLE "Scale" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Scale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Scale_code_key" ON "Scale"("code");

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "Scale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
