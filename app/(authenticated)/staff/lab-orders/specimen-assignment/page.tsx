import { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import SpecimenAssignmentView from "@/app/(authenticated)/_component/lab-orders/specimen-assignment/specimen-assignment-view";

export const metadata: Metadata = {
  title: "Specimen Assignment",
  description:
    "Assign specimens to laboratory order items and monitor their assignment status.",
};

export default async function StaffSpecimenAssignment() {
  return (
    <div className="relative flex flex-col gap-2 p-2 overflow-y-auto">
      <Card>
        <CardHeader className="gap-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-tight leading-none">
                Specimen Assignment
              </h1>
              <p className="text-muted-foreground text-sm">
                Assign specimens to laboratory order items and monitor their
                assignment status.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <SpecimenAssignmentView basePath="/staff/lab-orders" />
    </div>
  );
}
