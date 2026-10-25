import { ClipboardList } from "lucide-react";

export function DataTableIdle() {
  return (
    <div className="flex flex-col items-center justify-center border rounded-md px-5 py-[68px] text-center">
      <div className="bg-muted text-muted-foreground mb-3 flex size-11 items-center justify-center border">
        <ClipboardList className="size-5" />
      </div>
      <h3 className="text-base font-semibold">Nothing to show yet</h3>
      <p className="text-muted-foreground mt-1 max-w-md leading-6 text-sm">
        Enter search criteria or adjust the filters to display matching records.
      </p>
    </div>
  );
}
