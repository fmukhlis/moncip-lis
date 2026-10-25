import TableWrapper from "./_component/root";
import LabOrderablesHeader from "./_component/lab-orderables-header";

export default function ExternalLabOrderablesPage() {
  return (
    <div className="relative flex flex-col gap-2 p-2 overflow-y-auto">
      <LabOrderablesHeader />
      <TableWrapper />
    </div>
  );
}
