"use client";

import { useMemo, useState } from "react";
import { Portal } from "radix-ui";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { DataTableEmpty1 } from "@/components/ui/data-table/data-table-empty";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { getColumns } from "./columns";
import { isAssignableOrder } from "./helpers";
import { useGetLabOrdersActionQuery } from "@/features/lab-order/lab-order.api";
import CreateSpecimenDialog from "../create-specimen-dialog";
import SpecimenAssignmentControls from "./specimen-assignment-controls";
import SpecimenAssignmentOrderCard, {
  SpecimenAssignmentOrderCardSkeleton,
} from "./specimen-assignment-order-card";

const LOADING_CARD_COUNT = 3;

export default function SpecimenAssignmentView({
  basePath,
}: {
  basePath: string;
}) {
  // Server state: the shared lab order list query already returns each item with
  // its specimen assignments, so the worklist reuses it as-is.
  const { data, isFetching } = useGetLabOrdersActionQuery({});

  // UI state
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [dialogTriggerElement, setDialogTriggerElement] =
    useState<HTMLButtonElement | null>(null);

  const orders = useMemo(
    () => (data?.data ?? []).filter(isAssignableOrder),
    [data?.data],
  );

  const columns = useMemo(
    () =>
      getColumns({
        basePath,
        onAssignSpecimen: (order, triggerElement) => {
          setDialogTriggerElement(triggerElement);
          setActiveOrderId(order.id);
        },
      }),
    [basePath],
  );

  const table = useReactTable({
    data: orders,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;
  const filteredCount = table.getFilteredRowModel().rows.length;
  // Only block the list on the very first fetch; refetches keep the current rows
  // visible so assigning a specimen doesn't flash the whole page.
  const isLoading = isFetching && !data;

  return (
    <>
      <SpecimenAssignmentControls table={table} filteredCount={filteredCount} />
      <div className="flex min-h-[295px] flex-col gap-2 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: LOADING_CARD_COUNT }).map((_, index) => (
            <SpecimenAssignmentOrderCardSkeleton key={index} />
          ))
        ) : rows.length ? (
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
      {/* Dialogs are hoisted out of the scrollable list so they mount at the
          document body, the same way the lab order detail page does it. The
          dialog is the same one the detail page uses, so the creation and its
          toasts live there. Creating a specimen invalidates the `Specimen LIST`
          and `LabOrderItem` tags this query provides, which is what drops an
          assigned order off the worklist. */}
      <Portal.Root>
        <CreateSpecimenDialog
          labOrderId={activeOrderId ?? undefined}
          isOpen={activeOrderId !== null}
          triggerElement={dialogTriggerElement}
          onOpenChange={(open) => {
            if (!open) {
              setActiveOrderId(null);
            }
          }}
        />
      </Portal.Root>
    </>
  );
}
