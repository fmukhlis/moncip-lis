"use client";

import StatusTabs from "./status-tabs";
import PageControls from "./page-controls";
import { columns } from "./columns";
import { useMemo } from "react";
import { ClientTable } from "@/components/ui/data-table/client-table";
import { getCoreRowModel } from "@tanstack/react-table";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { getPaginationRowModel } from "@tanstack/react-table";
import { useGetLabOrdersActionQuery } from "@/features/lab-order/lab-order.api";
import { getFilteredRowModel, useReactTable } from "@tanstack/react-table";

export default function TableWrapper() {
  // Server state
  const { data: labOrdersData, isFetching } = useGetLabOrdersActionQuery({});

  const { data, orderedCount, inProcessCount, cancelledCount, completedCount } =
    useMemo(() => {
      const data = labOrdersData?.data ?? [];

      let orderedCount = 0;
      let inProcessCount = 0;
      let cancelledCount = 0;
      let completedCount = 0;

      data.forEach((d) => {
        if (d.status === "ORDERED") {
          orderedCount++;
        } else if (d.status === "IN_PROCESS") {
          inProcessCount++;
        } else if (d.status === "CANCELLED") {
          cancelledCount++;
        } else if (d.status === "COMPLETED") {
          completedCount++;
        }
      });

      return {
        data,
        orderedCount,
        cancelledCount,
        completedCount,
        inProcessCount,
      };
    }, [labOrdersData]);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <>
      <PageControls table={table} filteredCount={filteredCount} />
      <StatusTabs
        table={table}
        dataCount={data.length}
        orderedCount={orderedCount}
        cancelledCount={cancelledCount}
        completedCount={completedCount}
        inProcessCount={inProcessCount}
      />
      <div className="flex flex-col gap-2 min-h-[295px]">
        <ClientTable
          table={table}
          isLoading={isFetching}
          renderPagination={(table) => (
            <DataTablePagination table={table} isMultiSelectEnabled={false} />
          )}
        />
      </div>
    </>
  );
}
