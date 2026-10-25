"use client";

import TableFilter from "./table-filter";
import OrderableDetailSheet from "./orderable-detail-sheet";
import EditLisPerformableDialog from "./lis-performable-dialog/edit-lis-performable-dialog";
import CreateLisPerformableDialog from "./lis-performable-dialog/create-lis-performable-dialog";
import EditLisResultComponentDialog from "./lis-result-component-dialog/edit-lis-result-component-dialog";
import CreateLisResultComponentDialog from "./lis-result-component-dialog/create-lis-result-component-dialog";
import { Portal } from "radix-ui";
import { columns } from "./columns/orderable-columns";
import { useMemo } from "react";
import { ClientTable } from "@/components/ui/data-table/client-table";
import { useAppDispatch } from "@/hooks";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { getFilteredRowModel } from "@tanstack/react-table";
import { getPaginationRowModel } from "@tanstack/react-table";
import { ResultComponentStatusDialog } from "./lis-result-component-dialog/result-component-status-dialog";
import { setIsOrderableDetailSheetOpen } from "../slice";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useGetStoredExternalLabOrderablesActionQuery } from "@/features/external-lab-orderable/external-lab-orderable.api";

export default function TableWrapper() {
  // Global state
  const dispatch = useAppDispatch();

  // Server state
  const { data: storedExternalLabOrderablesData, isFetching } =
    useGetStoredExternalLabOrderablesActionQuery({});

  const { data, mappedCount, needsMappingCount } = useMemo(() => {
    const data = storedExternalLabOrderablesData?.data ?? [];

    let mappedCount = 0;
    let needsMappingCount = 0;

    for (const d of data) {
      if (d.performables.length) {
        mappedCount++;
      } else {
        needsMappingCount++;
      }
    }

    return {
      data,
      mappedCount,
      needsMappingCount,
    };
  }, [storedExternalLabOrderablesData]);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableMultiRowSelection: false,
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <>
      <TableFilter
        table={table}
        dataCount={data.length}
        mappedCount={mappedCount}
        filteredCount={filteredCount}
        needsMappingCount={needsMappingCount}
      />
      <div className="flex flex-col gap-2 min-h-[295px]">
        <ClientTable
          table={table}
          isLoading={isFetching}
          onBodyRowClick={(e, row) => {
            row.toggleSelected(true);
            dispatch(setIsOrderableDetailSheetOpen(true));
          }}
          renderPagination={(table) => (
            <DataTablePagination table={table} isMultiSelectEnabled={false} />
          )}
        />
      </div>
      <Portal.Root>
        <OrderableDetailSheet
          orderableId={
            table.getSelectedRowModel().rows.at(0)?.original?.id ?? null
          }
        />
        <CreateLisPerformableDialog
          orderableId={
            table.getSelectedRowModel().rows.at(0)?.original?.id ?? null
          }
        />
        <EditLisPerformableDialog
          orderableId={
            table.getSelectedRowModel().rows.at(0)?.original.id ?? null
          }
          performableId={
            table.getSelectedRowModel().rows.at(0)?.original.performables.at(0)
              ?.id ?? null
          }
        />
        <CreateLisResultComponentDialog
          performableId={
            table.getSelectedRowModel().rows.at(0)?.original.performables.at(0)
              ?.id ?? null
          }
        />
        <EditLisResultComponentDialog
          performableId={
            table.getSelectedRowModel().rows.at(0)?.original.performables.at(0)
              ?.id ?? null
          }
        />
        <ResultComponentStatusDialog />
      </Portal.Root>
    </>
  );
}
