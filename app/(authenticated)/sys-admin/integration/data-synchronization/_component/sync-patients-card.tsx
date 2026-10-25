import SyncPatientsCardAction from "./sync-patients-card-action";
import { Users } from "lucide-react";
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";

export function SyncPatientsCard() {
  return (
    <Card>
      <div className="flex items-start justify-between px-4">
        <div className="rounded-md bg-secondary p-2">
          <Users className="size-5" />
        </div>
      </div>
      <CardHeader>
        <CardTitle>
          <h2>Patients</h2>
        </CardTitle>
        <CardDescription>
          Patient demographic records registered in the HIS.
        </CardDescription>
      </CardHeader>
      <SyncPatientsCardAction />
    </Card>
  );
}
