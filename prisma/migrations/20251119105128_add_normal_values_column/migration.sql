-- AlterEnum
ALTER TYPE "Gender" ADD VALUE 'B';

-- AlterTable
ALTER TABLE "ReferenceRange" ADD COLUMN     "normalValues" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "valueLow" DROP NOT NULL,
ALTER COLUMN "valueHigh" DROP NOT NULL;
