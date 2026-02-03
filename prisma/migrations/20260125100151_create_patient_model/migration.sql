-- CreateEnum
CREATE TYPE "Source" AS ENUM ('MANUAL', 'HIS');

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "source" "Source" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "externalSystemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "linkedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);
