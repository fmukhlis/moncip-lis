"use client";

import RowMoreAction from "../lis-result-component-dialog/row-more-action";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { LisPerformableDetail } from "@/features/lis-performable/lis-performable.type";
import { X, Check, ChevronUp, ChevronDown, CircleSmall } from "lucide-react";

const columnHelper =
  createColumnHelper<LisPerformableDetail["resultComponents"][number]>();

export const columns = [
  columnHelper.accessor("displayName", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Component</div>
    ),
    cell: ({ column, getValue, row }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{getValue()}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.code}
          </span>
        </div>
      </div>
    ),
    size: 200,
    meta: {
      headerClassName: "w-full px-1.5",
      cellClassName: "w-full px-1.5 flex flex-col",
    },
  }),
  columnHelper.accessor("isRequired", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Required</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        {getValue() ? (
          <div className="flex justify-center">
            <Check aria-hidden="true" className="size-4 text-success" />
            <span className="sr-only">Required</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <X aria-hidden="true" className="size-4 text-muted-foreground" />
            <span className="sr-only">Not required</span>
          </div>
        )}
      </div>
    ),
    size: 80,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 text-center",
    },
  }),
  columnHelper.accessor("valueType", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Value Type</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        {<Badge variant="secondary">{getValue()}</Badge>}
      </div>
    ),
    size: 100,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 text-center",
    },
  }),
  columnHelper.accessor("unit.displayName", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>
        Unit / Precision
      </div>
    ),
    cell: ({ column, getValue, row }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        {row.original.valueType === "NUMERIC"
          ? `${getValue() || "—"} · ${row.original.decimalPlaces ?? 0} dec`
          : "—"}
      </div>
    ),
    size: 120,
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
      <div
        title={getValue() ? "Active" : "Inactive"}
        className={column.columnDef.meta?.cellClassName}
      >
        <CircleSmall
          className={cn(
            "size-5",
            getValue()
              ? "fill-success/70 text-success/50"
              : "fill-destructive/70 text-destructive/50",
          )}
        />
      </div>
    ),
    size: 80,
    meta: {
      headerClassName: "w-full px-1.5 flex justify-center",
      cellClassName: "w-full px-1.5 flex justify-center",
    },
  }),
  columnHelper.display({
    id: "actions",
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Actions</div>
    ),
    cell: ({ column, row }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <RowMoreAction resultComponent={row.original} />
      </div>
    ),
    size: 50,
    meta: {
      cellClassName: "w-full px-1.5 flex justify-center",
      headerClassName: "w-full px-1.5 text-center",
    },
  }),

  columnHelper.display({
    id: "order",
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Order</div>
    ),
    cell: ({ column, row, table }) => {
      const lastRowIndex = table.getCoreRowModel().rows.length - 1;

      return (
        <div className={column.columnDef.meta?.cellClassName}>
          <button
            type="button"
            onClick={() => table.options.meta?.moveRow(row.index, "UP")}
            disabled={row.index === 0}
            className="rounded py-1.5 p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label={`Move ${row.original.displayName} up`}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => table.options.meta?.moveRow(row.index, "DOWN")}
            disabled={row.index === lastRowIndex}
            className="rounded py-1.5 px-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label={`Move ${row.original.displayName} down`}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    },
    size: 50,
    meta: {
      headerClassName: "w-full px-1.5",
      cellClassName: "w-full px-1.5 flex flex-col items-center",
    },
  }),
] as ColumnDef<LisPerformableDetail["resultComponents"][number]>[];
