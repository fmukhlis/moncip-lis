-- CreateTable
CREATE TABLE "_LabTestToLaboratory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LabTestToLaboratory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LabTestToLaboratory_B_index" ON "_LabTestToLaboratory"("B");

-- AddForeignKey
ALTER TABLE "_LabTestToLaboratory" ADD CONSTRAINT "_LabTestToLaboratory_A_fkey" FOREIGN KEY ("A") REFERENCES "LabTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabTestToLaboratory" ADD CONSTRAINT "_LabTestToLaboratory_B_fkey" FOREIGN KEY ("B") REFERENCES "Laboratory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
