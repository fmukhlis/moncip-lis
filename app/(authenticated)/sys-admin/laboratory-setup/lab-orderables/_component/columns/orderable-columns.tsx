"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { StoredExternalLabOrderable } from "@/features/external-lab-orderable/external-lab-orderable.type";
import {
  Layers,
  TestTube,
  CircleSmall,
  ChevronRight,
  TriangleAlert,
} from "lucide-react";

const columnHelper = createColumnHelper<StoredExternalLabOrderable>();

export const columns = [
  columnHelper.display({
    id: "action",
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}></div>
    ),
    cell: ({ column, row }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <Button
          size="icon-sm"
          variant={"ghost"}
          className="size-5"
          aria-label={`View details for ${row.original.externalDisplay}`}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    ),
    size: 0,
    maxSize: 0,
    enableGlobalFilter: false,
    meta: {
      headerClassName: "w-full pl-1.5 text-center",
      cellClassName: "w-full pl-1.5 text-center",
    },
  }),
  columnHelper.accessor("externalDisplay", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Orderable</div>
    ),
    cell: ({ column, getValue, row }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{getValue()}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.externalCode}
          </span>
        </div>
      </div>
    ),
    size: 300,
    meta: {
      headerClassName: "w-full pr-1.5",
      cellClassName: "w-full pr-1.5",
    },
  }),
  columnHelper.accessor("type", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Type</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <Badge variant="outline">
          {getValue() === "PANEL" ? (
            <Layers className="h-3 w-3" />
          ) : (
            <TestTube className="h-3 w-3" />
          )}
          {getValue() === "PANEL" ? "Panel" : "Test"}
        </Badge>
      </div>
    ),
    size: 80,
    enableGlobalFilter: false,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 text-center",
    },
  }),
  columnHelper.accessor(
    (row) => row.performables.at(0)?.department?.displayName,
    {
      id: "department",
      header: ({ column }) => (
        <div className={column.columnDef.meta?.headerClassName}>
          Departments
        </div>
      ),
      cell: ({ column, getValue }) => (
        <div className={column.columnDef.meta?.cellClassName}>
          <Badge variant="outline">
            <CircleSmall className="fill-info/30 text-info" />
            {getValue() ?? "Not Configured"}
          </Badge>
        </div>
      ),
      size: 120,
      enableGlobalFilter: false,
      meta: {
        headerClassName: "w-full px-1.5 text-center",
        cellClassName: "w-full px-1.5 text-center",
      },
    },
  ),
  columnHelper.accessor((row) => row.performables.at(0)?.displayName, {
    id: "lisMapping",
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>LIS Mapping</div>
    ),
    cell: ({ column, getValue, row }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        {getValue() ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm">{getValue()}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {row.original.performables.at(0)?.type}
            </span>
          </div>
        ) : (
          <Badge
            variant="outline"
            className="bg-warning/15 border-warning/30 text-warning"
          >
            <TriangleAlert />
            Needs mapping
          </Badge>
        )}
      </div>
    ),
    size: 200,
    enableGlobalFilter: false,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue === "NEEDS_MAPPING") {
        return row.original.performables.length === 0;
      }
      if (filterValue === "MAPPED") {
        return row.original.performables.length > 0;
      }
      return true;
    },
    meta: {
      headerClassName: "w-full px-1.5",
      cellClassName: "w-full px-1.5",
    },
  }),
  columnHelper.accessor("isActive", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Status</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        {getValue() ? (
          <Badge
            variant="outline"
            className="bg-success/15 border-success/30 text-success"
          >
            Active
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-destructive/15 border-destructive/30 text-destructive"
          >
            Inactive
          </Badge>
        )}
      </div>
    ),
    size: 80,
    enableGlobalFilter: false,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 text-center",
    },
  }),
  columnHelper.accessor("lastSyncedAt", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Last Synced</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        {getValue()
          ? formatDistanceToNow(getValue() as string, { addSuffix: true })
          : "Never"}
      </div>
    ),
    size: 150,
    enableGlobalFilter: false,
    meta: {
      headerClassName: "w-full px-1.5",
      cellClassName: "w-full px-1.5",
    },
  }),
] as ColumnDef<StoredExternalLabOrderable>[];
