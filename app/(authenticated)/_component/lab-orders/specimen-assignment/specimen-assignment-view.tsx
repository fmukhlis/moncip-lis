"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { DataTableEmpty1 } from "@/components/ui/data-table/data-table-empty";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { getColumns } from "./columns";
import {
  SPECIMEN_ASSIGNMENT_ORDERS,
  type SpecimenAssignmentOrder,
} from "./data";
import SpecimenAssignmentDialog, {
  type SpecimenAssignmentDialogValues,
} from "./specimen-assignment-dialog";
import SpecimenAssignmentControls from "./specimen-assignment-controls";
import SpecimenAssignmentHeading from "./specimen-assignment-heading";
import SpecimenAssignmentOrderCard from "./specimen-assignment-order-card";

export default function SpecimenAssignmentView() {
  const [activeOrder, setActiveOrder] =
    useState<SpecimenAssignmentOrder | null>(null);
  const [dialogTriggerElement, setDialogTriggerElement] =
    useState<HTMLButtonElement | null>(null);

  const columns = useMemo(
    () =>
      getColumns({
        onAssignSpecimen: (order, triggerElement) => {
          setDialogTriggerElement(triggerElement);
          setActiveOrder(order);
        },
      }),
    [],
  );

  const table = useReactTable({
    data: SPECIMEN_ASSIGNMENT_ORDERS,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;
  const filteredCount = table.getFilteredRowModel().rows.length;

  const handleDialogSubmit = (values: SpecimenAssignmentDialogValues) => {
    // UI-only preview: the worklist is not connected to the create specimen
    // action yet, so the dialog closes and reports what would have been sent.
    setActiveOrder(null);
    toast.info("Specimen assignment is not connected yet", {
      description: `${values.orderItemIds.length} order item(s) would be linked to the selected specimen type.`,
    });
  };

  return (
    <div className="relative flex flex-col gap-2 overflow-y-auto p-2">
      <SpecimenAssignmentHeading />
      <SpecimenAssignmentControls table={table} filteredCount={filteredCount} />
      <div className="flex min-h-[295px] flex-col gap-2 overflow-y-auto">
        {rows.length ? (
          rows.map((row) => (
            <SpecimenAssignmentOrderCard key={row.id} row={row} />
          ))
        ) : (
          <DataTableEmpty1 />
        )}
      </div>
      <DataTablePagination
        className="-mb-2"
        table={table}
        isMultiSelectEnabled={false}
      />
      <SpecimenAssignmentDialog
        isOpen={activeOrder !== null}
        order={activeOrder}
        triggerElement={dialogTriggerElement}
        onOpenChange={(open) => {
          if (!open) {
            setActiveOrder(null);
          }
        }}
        onSubmit={handleDialogSubmit}
      />
    </div>
  );
}
