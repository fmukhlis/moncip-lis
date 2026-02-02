import React from "react";
import PatientsTable from "@/components/patient-registry/patients-table";
import DeletePatientDialog from "@/components/patient-registry/delete-patient-dialog";
import EditPatientManualDialog from "@/components/patient-registry/edit-patient-manual-dialog";

import { Separator } from "@/components/ui/separator";
import { patientsTableColumns } from "@/components/patient-registry/columns";

export default function StaffPatientRegistry() {
  return (
    <div className="flex flex-1 flex-col gap-7 p-4">
      <div>
        <div className="flex flex-col gap-4">
          <div className="px-1.5">
            <h1 className="text-2xl font-semibold mb-2">Patient Registry</h1>
            <div>
              Central list of patients used for daily laboratory and clinical
              operations.
            </div>
          </div>
          <Separator />
          <PatientsTable columns={patientsTableColumns} />
        </div>
        <EditPatientManualDialog />
        <DeletePatientDialog />
      </div>
    </div>
  );
}
