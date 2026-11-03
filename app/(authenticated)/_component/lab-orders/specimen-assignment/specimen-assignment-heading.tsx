import { Card, CardHeader } from "@/components/ui/card";

export default function SpecimenAssignmentHeading() {
  return (
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
  );
}
