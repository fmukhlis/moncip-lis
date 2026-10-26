import SyncHistory from "./_component/sync-history";
import DataSynchronizationHeader from "./_component/data-synchronization-header";
import { SyncPatientsCard } from "./_component/sync-patients-card";
import { SyncLabOrderablesCard } from "./_component/sync-lab-orderables-card";

export default async function DataSynchronization() {
  return (
    <div className="overflow-y-auto relative flex flex-col gap-2 p-2">
      <DataSynchronizationHeader />
      <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(290px,1fr))]">
        <SyncLabOrderablesCard />
        <SyncPatientsCard />
      </div>
      <SyncHistory />
    </div>
  );
}
