import React from "react";
import PatientsTable from "@/components/patient-registry/patients-table";

import { Separator } from "@/components/ui/separator";
import { patientsTableColumns } from "@/components/patient-registry/columns";

export default function DoctorPatientRegistry() {
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
          <div className="flex flex-col flex-1 gap-4 px-1.5">
            <PatientsTable columns={patientsTableColumns} />
          </div>
        </div>
      </div>
    </div>
  );
}
