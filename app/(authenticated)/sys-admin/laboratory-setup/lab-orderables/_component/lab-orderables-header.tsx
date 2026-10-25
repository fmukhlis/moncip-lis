import { Card, CardHeader } from "@/components/ui/card";

export default function LabOrderablesHeader() {
  return (
    <Card>
      <CardHeader className="gap-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight leading-none">
              Lab Orderables
            </h1>
            <p className="text-muted-foreground text-sm">
              Tests and panels synced from connected hospital systems. Map each
              one to a LIS test definition and its result components before it
              can be used for result entry.
            </p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
