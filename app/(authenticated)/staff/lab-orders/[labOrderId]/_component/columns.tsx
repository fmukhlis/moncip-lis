"use client";

import PerformableTypeBadge from "./performable-type-badge";
import LabOrderPriorityBadge from "../../_component/lab-order-priority-badge";
import LabOrderItemStatusBadge from "./lab-order-item-status-badge";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { LabOrderDetail } from "@/features/lab-order/lab-order.type";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const columnHelper = createColumnHelper<LabOrderDetail["items"][number]>();

export const columns = [
  columnHelper.accessor("performable.displayName", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Test Name</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>{getValue()}</div>
    ),
    meta: {
      headerClassName: "w-full px-1.5",
      cellClassName: "w-full px-1.5",
    },
    size: 200,
  }),
  columnHelper.accessor("performable.type", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Type</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <PerformableTypeBadge type={getValue()} />
      </div>
    ),
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 text-center",
    },
    size: 100,
  }),
  columnHelper.accessor("priority", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Priority</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        {getValue() ? <LabOrderPriorityBadge priority={getValue()!} /> : "—"}
      </div>
    ),
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 text-center",
    },
    size: 100,
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Status</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <LabOrderItemStatusBadge status={getValue()} />
      </div>
    ),
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 text-center",
    },
    size: 100,
  }),
  columnHelper.accessor(
    (row) =>
      row.specimens?.find(({ endedAt }) => !endedAt)?.specimen.specimenType
        .displayName ?? "—",
    {
      id: "specimen",
      header: ({ column }) => (
        <div className={column.columnDef.meta?.headerClassName}>Specimen</div>
      ),
      cell: ({ column, getValue }) => (
        <div className={column.columnDef.meta?.cellClassName}>
          <div className="flex items-center gap-1">{getValue()}</div>
        </div>
      ),
      meta: {
        headerClassName: "w-full px-1.5",
        cellClassName: "w-full px-1.5",
      },
      size: 200,
    },
  ),
  columnHelper.accessor((row) => row.note ?? "—", {
    id: "note",
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Note</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        {getValue() !== "—" ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="sr-only">See notes</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="max-w-52 text-xs">{getValue()}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          "—"
        )}
      </div>
    ),
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 text-center",
    },
    size: 0,
  }),
] as ColumnDef<LabOrderDetail["items"][number]>[];
