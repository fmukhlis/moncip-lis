import LabOrderablesLastSyncStatus from "./lab-orderables-last-sync-status";
import SyncLabOrderablesCardAction from "./sync-lab-orderables-card-action";
import { TestTubeDiagonal } from "lucide-react";
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";

export function SyncLabOrderablesCard() {
  return (
    <Card>
      <div className="flex items-start justify-between px-4">
        <div className="rounded-md bg-secondary p-2">
          <TestTubeDiagonal className="size-5" />
        </div>
        <LabOrderablesLastSyncStatus />
      </div>
      <CardHeader>
        <CardTitle>
          <h2>Lab Orderables</h2>
        </CardTitle>
        <CardDescription>
          Laboratory tests available in the HIS.
        </CardDescription>
      </CardHeader>
      <SyncLabOrderablesCardAction />
    </Card>
  );
}
