-- CreateTable
CREATE TABLE "_LabTestGroupToLaboratory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LabTestGroupToLaboratory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LabTestGroupToLaboratory_B_index" ON "_LabTestGroupToLaboratory"("B");

-- AddForeignKey
ALTER TABLE "_LabTestGroupToLaboratory" ADD CONSTRAINT "_LabTestGroupToLaboratory_A_fkey" FOREIGN KEY ("A") REFERENCES "LabTestGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabTestGroupToLaboratory" ADD CONSTRAINT "_LabTestGroupToLaboratory_B_fkey" FOREIGN KEY ("B") REFERENCES "Laboratory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
