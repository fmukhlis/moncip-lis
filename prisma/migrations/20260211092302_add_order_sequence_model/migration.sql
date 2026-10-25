-- CreateTable
CREATE TABLE "OrderSequence" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "dateKey" TEXT NOT NULL,

    CONSTRAINT "OrderSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderSequence_dateKey_key" ON "OrderSequence"("dateKey");
