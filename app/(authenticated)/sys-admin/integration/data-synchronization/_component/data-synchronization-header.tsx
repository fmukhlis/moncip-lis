import { Card, CardHeader } from "@/components/ui/card";

export default function DataSynchronizationHeader() {
  return (
    <Card>
      <CardHeader className="gap-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight leading-none">
              Data Synchronization
            </h1>
            <p className="text-muted-foreground text-sm">
              Import and synchronize data from external systems.
            </p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
