import { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import TableWrapper from "./_component/table-wrapper";

export const metadata: Metadata = {
  title: "Lab Order",
  description:
    "View, track, and manage all patient laboratory test orders and their current status.",
};

export default async function StaffLabOrder() {
  return (
    <div className="relative flex flex-col gap-2 p-2 overflow-y-auto">
      <Card>
        <CardHeader className="gap-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-tight leading-none">
                Lab Orders
              </h1>
              <p className="text-muted-foreground text-sm">
                View, track, and manage all patient laboratory test orders and
                their current status.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
      <TableWrapper />
    </div>
  );
}
