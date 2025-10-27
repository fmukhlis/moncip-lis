-- AlterTable
ALTER TABLE "User" ADD COLUMN     "laboratoryId" TEXT;

-- CreateTable
CREATE TABLE "Laboratory" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Laboratory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
