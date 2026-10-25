"use client";

import Link from "next/link";
import LabOrderStatusBadge from "./lab-order-status-badge";
import LabOrderPriorityBadge from "./lab-order-priority-badge";
import { Badge } from "@/components/ui/badge";
import { LabOrder } from "@/features/lab-order/lab-order.type";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { endOfDay, format, isWithinInterval, startOfDay } from "date-fns";

const columnHelper = createColumnHelper<LabOrder>();

export const columns = [
  columnHelper.accessor("no", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Order No</div>
    ),
    cell: ({ column, getValue, row }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <Link
          href={`/staff/lab-orders/${row.id}`}
          className="underline-offset-4 hover:underline"
        >
          {getValue()}
        </Link>
      </div>
    ),
    size: 50,
    meta: {
      headerClassName: "w-full px-1.5",
      cellClassName: "w-full px-1.5",
    },
  }),
  columnHelper.accessor("patient.name", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Patient Name</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>{getValue()}</div>
    ),
    size: 150,
    meta: {
      headerClassName: "w-full px-1.5",
      cellClassName: "w-full px-1.5",
    },
  }),
  columnHelper.accessor("patient.mrn", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>MRN</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>{getValue()}</div>
    ),
    size: 100,
    meta: {
      headerClassName: "w-full px-1.5",
      cellClassName: "w-full px-1.5",
    },
  }),

  columnHelper.accessor("priority", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Priority</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <LabOrderPriorityBadge priority={getValue()} />
      </div>
    ),
    size: 80,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 text-center",
    },
    enableGlobalFilter: false,
  }),
  columnHelper.accessor(
    (row) => row.items.map(({ performable }) => performable),
    {
      id: "items",
      header: ({ column }) => (
        <div className={column.columnDef.meta?.headerClassName}>Tests</div>
      ),
      cell: ({ column, getValue }) => {
        const items = getValue();
        const topThreeItems = items.slice(0, 3);
        const remainingCount = items.length - 3;

        return (
          <div className={column.columnDef.meta?.cellClassName}>
            {topThreeItems.map(({ id, displayName }) => (
              <Badge key={id} variant="secondary">
                {displayName}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Badge variant="secondary">+{remainingCount} more</Badge>
            )}
          </div>
        );
      },
      size: 200,
      meta: {
        headerClassName: "w-full px-1.5",
        cellClassName: "w-full px-1.5 flex gap-1",
      },
      filterFn: (row, columnId, filterValue) => {
        const items =
          row.getValue<LabOrder["items"][number]["performable"][]>(columnId);
        const lowerCaseFilterValue = String(filterValue).toLowerCase();

        if (!items || !lowerCaseFilterValue) return true;

        return items.some(({ displayName }) =>
          displayName.toLowerCase().includes(lowerCaseFilterValue),
        );
      },
    },
  ),
  columnHelper.accessor("orderedAt", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Ordered at</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        {format(getValue(), "dd MMM yyyy, HH:mm")}
      </div>
    ),
    size: 120,
    meta: {
      headerClassName: "w-full px-1.5",
      cellClassName: "w-full px-1.5",
    },
    filterFn: (row, columnId, filterValue) => {
      const orderedAt = row.getValue<string>(columnId);

      if (!orderedAt || (!filterValue?.from && !filterValue?.to)) {
        return true;
      }

      const orderedAtDate = new Date(orderedAt);

      if (filterValue.from && !filterValue.to) {
        return orderedAtDate >= startOfDay(filterValue.from);
      }

      if (!filterValue.from && filterValue.to) {
        return orderedAtDate <= endOfDay(filterValue.to);
      }

      if (filterValue.from && filterValue.to) {
        return isWithinInterval(orderedAtDate, {
          start: startOfDay(filterValue.from),
          end: endOfDay(filterValue.to),
        });
      }

      return true;
    },
    enableGlobalFilter: false,
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Status</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <LabOrderStatusBadge status={getValue()} />
      </div>
    ),
    size: 80,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 text-center",
    },
    enableGlobalFilter: false,
  }),
] as ColumnDef<LabOrder>[];
