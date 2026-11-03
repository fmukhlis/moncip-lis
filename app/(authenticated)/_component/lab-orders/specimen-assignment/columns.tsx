"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { CardTitle } from "@/components/ui/card";
import ClientDateTimeText from "@/components/ui/client-date-time-text";
import LabOrderPriorityBadge from "@/app/(authenticated)/_component/lab-orders/lab-order-priority-badge";
import {
  AssignSpecimenButton,
  AssignmentProgress,
  OrderItemsCollapsible,
  PatientCollapsible,
} from "./order-card-sections";
import type { SpecimenAssignmentOrder } from "./helpers";

const columnHelper = createColumnHelper<SpecimenAssignmentOrder>();

/**
 * Column definitions for the card worklist. The first three accessors drive the
 * global search (order number, patient name, patient MRN); the remaining
 * columns only describe how a card renders its sections.
 */
export function getColumns({
  basePath,
  onAssignSpecimen,
}: {
  basePath: string;
  onAssignSpecimen: (
    order: SpecimenAssignmentOrder,
    trigger: HTMLButtonElement,
  ) => void;
}) {
  return [
    columnHelper.accessor("no", {
      id: "no",
      header: "Order No",
      cell: ({ row, getValue }) => (
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base font-semibold tracking-tight">
              <Link
                href={`${basePath}/${row.original.id}`}
                className="underline-offset-4 hover:underline"
              >
                {getValue()}
              </Link>
            </CardTitle>
            <LabOrderPriorityBadge priority={row.original.priority} />
          </div>
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <CalendarClock className="size-3.5" />
            Order created{" "}
            <ClientDateTimeText
              formatStr="dd MMM yyyy, HH:mm"
              dateTime={row.original.createdAt}
            />
          </p>
        </div>
      ),
    }),
    columnHelper.accessor("patient.name", {
      id: "patientName",
      header: "Patient Name",
      // Search-only: the value is rendered by the `patient` column below.
      cell: () => null,
    }),
    columnHelper.accessor("patient.mrn", {
      id: "patientMrn",
      header: "Patient MRN",
      // Search-only: the value is rendered by the `patient` column below.
      cell: () => null,
    }),
    columnHelper.display({
      id: "patient",
      header: "Patient Information",
      enableGlobalFilter: false,
      cell: ({ row }) => <PatientCollapsible order={row.original} />,
    }),
    columnHelper.display({
      id: "items",
      header: "Order Items",
      enableGlobalFilter: false,
      cell: ({ row }) => <OrderItemsCollapsible order={row.original} />,
    }),
    columnHelper.display({
      id: "progress",
      header: "Assignment Progress",
      enableGlobalFilter: false,
      cell: ({ row }) => <AssignmentProgress order={row.original} />,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <AssignSpecimenButton
          order={row.original}
          onAssignSpecimen={onAssignSpecimen}
        />
      ),
    }),
  ] as ColumnDef<SpecimenAssignmentOrder>[];
}
