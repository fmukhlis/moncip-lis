"use client";

import { Table } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Ban,
  Loader,
  FileText,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

export default function StatusTabs<TData>({
  table,
  dataCount,
  orderedCount,
  cancelledCount,
  completedCount,
  inProcessCount,
}: {
  table: Table<TData>;
  dataCount: number;
  orderedCount: number;
  cancelledCount: number;
  completedCount: number;
  inProcessCount: number;
}) {
  const statusColumn = table.getColumn("status");

  return (
    <ToggleGroup
      type="single"
      size={"default"}
      variant="outline"
      onValueChange={(value) => {
        statusColumn?.setFilterValue(value === "ALL" ? undefined : value);
      }}
      className="min-w-full justify-start flex-wrap"
    >
      <ToggleGroupItem value="ALL">
        <ClipboardList className="size-4" />
        <span>All</span>
        <Badge className="px-1 py-0">{dataCount}</Badge>
      </ToggleGroupItem>
      <ToggleGroupItem value="ORDERED">
        <FileText className="size-4" />
        <span>Ordered</span>
        <Badge className="bg-info/15 px-1 py-0 text-info">{orderedCount}</Badge>
      </ToggleGroupItem>
      <ToggleGroupItem value="IN_PROCESS">
        <Loader className="size-4" />
        <span>In process</span>
        <Badge className="bg-warning/15 px-1 py-0 text-warning">
          {inProcessCount}
        </Badge>
      </ToggleGroupItem>
      <ToggleGroupItem value="COMPLETED">
        <CheckCircle2 className="size-4" />
        <span>Completed</span>
        <Badge className="bg-success/15 px-1 py-0 text-success">
          {completedCount}
        </Badge>
      </ToggleGroupItem>
      <ToggleGroupItem value="CANCELLED">
        <Ban className="size-4" />
        <span>Cancelled</span>
        <Badge className="bg-destructive/15 px-1 py-0 text-destructive">
          {cancelledCount}
        </Badge>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
