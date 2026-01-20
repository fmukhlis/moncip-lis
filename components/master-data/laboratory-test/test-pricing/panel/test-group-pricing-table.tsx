"use client";

import React from "react";
import ExpandedRow from "./expanded-row";
import TestGroupPricingTableHeader from "./test-group-pricing-table-header";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useAppSelector } from "@/hooks";
import { LocalTestGroupSummary } from "@/features/master-data/type/test-pricing";
import { useGetLocalTestGroupsQuery } from "@/features/master-data/api/serverFunction";
import {
  Table as TanStackTable,
  ColumnDef,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { TestGroupPricingTableSkeleton } from "../skeletons";

type TestGroupPricingTableProps = {
  columns: ColumnDef<LocalTestGroupSummary>[];
};

export default function TestGroupPricingTable({
  columns,
}: TestGroupPricingTableProps) {
  // RTK Query
  const { data: queryResponse, isLoading } = useGetLocalTestGroupsQuery({});
  const data = queryResponse?.data ?? [];

  // Redux Toolkit
  const showLocalTestGroups = useAppSelector(
    (state) => state.testPricing.showLocalTestGroups,
  );

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const memoizedData = React.useMemo(() => {
    switch (showLocalTestGroups) {
      case "Active":
        return data.filter(({ deletedAt }) => !deletedAt);
      case "Inactive":
        return data.filter(({ deletedAt }) => !!deletedAt);
      case "Orderable":
        return data.filter(({ notOrderableReason }) => !notOrderableReason);
      case "Not Orderable":
        return data.filter(({ notOrderableReason }) => !!notOrderableReason);
      default:
        return data;
    }
  }, [data, showLocalTestGroups]);

  const table = useReactTable({
    data: memoizedData,
    columns,
    getRowId: ({ id }) => id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  if (isLoading) {
    return <TestGroupPricingTableSkeleton />;
  }

  return (
    <div className="flex flex-col flex-1 gap-4 p-1">
      <TestGroupPricingTableHeader
        onSearch={(value) => {
          table.getColumn("name")?.setFilterValue(value);
        }}
        rowLength={table.getRowModel().flatRows.length}
      />
      <div className="overflow-hidden rounded-md border">
        <Table
          className="grid"
          containerRef={tableContainerRef}
          containerClassName="relative h-[400px] overflow-auto"
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
                    className="font-semibold h-11 border-x flex items-center"
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
          <TestGroupPricingTableBody
            table={table}
            showOption={showLocalTestGroups}
            tableContainerRef={tableContainerRef}
          />
        </Table>
      </div>
    </div>
  );
}

const TestGroupPricingTableBody = ({
  table,
  showOption,
  tableContainerRef,
}: {
  table: TanStackTable<LocalTestGroupSummary>;
  showOption: "All" | "Active" | "Inactive" | "Orderable" | "Not Orderable";
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const [, forceRerender] = React.useReducer((x) => x + 1, 0);

  const { rows } = table.getRowModel();

  const expandedState = table.getState().expanded;

  const visualRows = React.useMemo(() => {
    const newVisualRows = [];

    for (const row of rows) {
      newVisualRows.push({ type: "row", row });

      if (typeof expandedState === "object" && expandedState[row.id]) {
        newVisualRows.push({ type: "details", row });
      }
    }

    return newVisualRows;
  }, [expandedState, rows]);

  const virtualizer = useVirtualizer({
    count: visualRows.length,
    overscan: 1,
    estimateSize: () => 44,
    getItemKey: (index) => {
      const item = visualRows[index];
      return item.type === "row" ? item.row.id : item.row.id + "-details";
    },
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
  }, [showOption]);

  return (
    <TableBody
      style={{ height: `${virtualizer.getTotalSize()}px` }}
      className="grid relative"
    >
      {rows.length ? (
        virtualizer.getVirtualItems().map(({ start, key, index }) => {
          const visualRow = visualRows[index];

          return visualRow.type === "row" ? (
            <TableRow
              key={key}
              style={{ transform: `translateY(${start}px)` }}
              className="flex absolute w-full"
              data-state={visualRow.row.getIsExpanded() ? "expanded" : ""}
            >
              {visualRow.row.getVisibleCells().map((cell) => (
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
          ) : (
            visualRow.row.getIsExpanded() && (
              <ExpandedRow
                ref={virtualizer.measureElement} // Measure dynamic row height
                key={key}
                style={{ transform: `translateY(${start}px)` }}
                className="flex absolute w-full hover:bg-transparent"
                data-index={index} // Needed for dynamic row height measurement
                localTestGroupId={visualRow.row.id}
                tableColumnsCount={visualRow.row.getAllCells().length}
              />
            )
          );
        })
      ) : (
        <TableRow
          style={{ transform: `translateY(0px)` }}
          className="flex absolute w-full"
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
