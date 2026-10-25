import { Button } from "../button";
import { ClipboardList, RotateCcw } from "lucide-react";

export function DataTableEmpty1() {
  return (
    <div className="flex flex-col items-center justify-center border rounded-md px-5 py-[68px] text-center">
      <div className="bg-muted text-muted-foreground mb-3 flex size-11 items-center justify-center border">
        <ClipboardList className="size-5" />
      </div>
      <h3 className="text-base font-semibold">No items found</h3>
      <p className="text-muted-foreground mt-1 max-w-md leading-6 text-sm">
        There are no items yet, or the current filters do not return any data.
      </p>
    </div>
  );
}

export function DataTableEmpty2() {
  return (
    <div className="flex flex-col items-center justify-center border rounded-md px-5 py-[68px] text-center">
      <div className="bg-muted text-muted-foreground mb-3 flex size-11 items-center justify-center border">
        <ClipboardList className="size-5" />
      </div>
      <h3 className="text-base font-semibold">No items found</h3>
      <p className="text-muted-foreground mt-1 max-w-md leading-6 text-sm">
        There are no items yet, or the current filters do not return any data.
      </p>
      <Button className="mt-3" disabled>
        <RotateCcw className="size-4" />
        Refresh
      </Button>
    </div>
  );
}
