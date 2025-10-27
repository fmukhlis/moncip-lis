-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'doctor', 'lab_tech');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'admin';
