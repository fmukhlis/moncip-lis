"use client";

import React from "react";
import PatientsTableHeader from "./patients-table-header";
import PatientsTableSkeleton from "./patients-table-skeleton";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useAppSelector } from "@/hooks";
import { getLocalPatientsAction } from "@/features/operations/patient-registry/action/query";
import { useGetLocalPatientsActionQuery } from "@/features/operations/patient-registry/api/patient";
import {
  Table as TanStackTable,
  ColumnDef,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../ui/table";

export default function PatientsTable({
  columns,
}: {
  columns: ColumnDef<
    Awaited<ReturnType<typeof getLocalPatientsAction>>["data"][number]
  >[];
}) {
  // Redux Toolkit
  const localPatientsSource = useAppSelector(
    (state) => state.patientRegistry.localPatientsSource,
  );

  // RTK Query
  const { isLoading, data: localPatientsActionData } =
    useGetLocalPatientsActionQuery({});

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const memoizedPatients = React.useMemo(() => {
    const data = localPatientsActionData?.data ?? [];

    switch (localPatientsSource) {
      case "HIS":
        return data.filter(({ source }) => source === "HIS");
      case "Local":
        return data.filter(({ source }) => source === "MANUAL");
      default:
        return data;
    }
  }, [localPatientsActionData?.data, localPatientsSource]);

  const table = useReactTable({
    data: memoizedPatients,
    columns,
    getRowId: ({ id }) => id,
    initialState: {
      sorting: [{ desc: false, id: "name" }],
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableGlobalFilter: true,
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return <PatientsTableSkeleton />;
  }

  return (
    <div className="flex flex-col flex-1 gap-4 px-1.5">
      <PatientsTableHeader
        rowLength={table.getRowCount()}
        onSearch={(val) => {
          table.setGlobalFilter(val);
        }}
      />
      <div className="overflow-hidden rounded-md border">
        <Table
          className="grid"
          containerRef={tableContainerRef}
          containerClassName="relative h-[500px] overflow-auto"
        >
          <TableHeader className="grid sticky top-0 z-[1]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted hover:bg-muted flex w-full"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: header.getSize(),
                      flex: header.getSize() > 300 ? 1 : "none",
                    }}
                    colSpan={header.colSpan}
                    className={`font-semibold h-11 border-x flex items-center`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <PatientsTableBody
            table={table}
            tableContainerRef={tableContainerRef}
            localPatientsSource={localPatientsSource}
          />
        </Table>
      </div>
    </div>
  );
}

const PatientsTableBody = ({
  table,
  tableContainerRef,
  localPatientsSource,
}: {
  table: TanStackTable<
    Awaited<ReturnType<typeof getLocalPatientsAction>>["data"][number]
  >;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  localPatientsSource: "All" | "HIS" | "Local";
}) => {
  const [, forceRerender] = React.useReducer((x) => x + 1, 0);

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    overscan: 1,
    getItemKey(index) {
      const { id } = rows[index];
      return id;
    },
    estimateSize: () => 44,
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    getScrollElement: () => tableContainerRef.current,
  });

  React.useEffect(() => {
    forceRerender();
    virtualizer.scrollBy(0);
  }, [localPatientsSource, virtualizer]);

  return (
    <TableBody
      style={{ height: `${virtualizer.getTotalSize()}px` }}
      className="grid relative"
    >
      {rows.length ? (
        virtualizer.getVirtualItems().map(({ index, start, key }) => (
          <TableRow
            key={key}
            style={{ transform: `translateY(${start}px)` }}
            className="flex w-full absolute"
          >
            {rows[index].getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                style={{
                  width: cell.column.getSize(),
                  flex: cell.column.getSize() > 300 ? 1 : "none",
                }}
                className="h-11 flex items-center [&:has([role=checkbox])]:pr-2"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow
          style={{ transform: `translateY(0px)` }}
          className="flex w-full absolute"
        >
          <TableCell
            colSpan={table.getAllColumns().length}
            className="h-11 flex items-center w-full"
          >
            <div className="text-center w-full text-muted-foreground">
              No results.
            </div>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
};
