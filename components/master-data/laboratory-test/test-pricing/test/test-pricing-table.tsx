"use client";

import React from "react";
import TestPricingTableHeader from "./test-pricing-table-header";
import TestPricingDetailsTable from "./test-pricing-details-table";

import { useVirtualizer } from "@tanstack/react-virtual";
import { LocalTestSummary } from "@/features/master-data/type/test-pricing";
import { useGetLocalTestsQuery } from "@/features/master-data/api/serverFunction";
import { TestPricingTableSkeleton } from "../skeletons";
import { testPricingDetailsColumns } from "./columns";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setTestPricingTableRowSelection } from "@/features/master-data/test-pricing-slice";
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

type TestPricingTableProps = {
  columns: ColumnDef<LocalTestSummary>[];
};

export default function TestPricingTable({ columns }: TestPricingTableProps) {
  // RTK Query
  const { data: queryResponse, isLoading } = useGetLocalTestsQuery({});

  // Redux Toolkit
  const rowSelection = useAppSelector(
    (state) => state.testPricing.testPricingTableRowSelection,
  );
  const showLocalTests = useAppSelector(
    (state) => state.testPricing.showLocalTests,
  );
  const dispatch = useAppDispatch();

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const memoizedData = React.useMemo(() => {
    const data = queryResponse?.data ?? [];
    switch (showLocalTests) {
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
  }, [queryResponse?.data, showLocalTests]);

  const table = useReactTable({
    data: memoizedData,
    state: { rowSelection },
    columns,
    getRowId: ({ id }) => id,
    initialState: {
      sorting: [
        {
          id: "name",
          desc: false,
        },
      ],
    },
    onRowSelectionChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(rowSelection) : updater;
      dispatch(setTestPricingTableRowSelection(next));
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  if (isLoading) {
    return <TestPricingTableSkeleton />;
  }

  return (
    <div className="flex flex-col flex-1 gap-4 p-1">
      <TestPricingTableHeader
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
          <TestPricingTableBody
            table={table}
            showOption={showLocalTests}
            tableContainerRef={tableContainerRef}
          />
        </Table>
      </div>
    </div>
  );
}

type TestPricingTableBodyProps = {
  table: TanStackTable<LocalTestSummary>;
  showOption: string;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
};

function TestPricingTableBody({
  table,
  showOption,
  tableContainerRef,
}: TestPricingTableBodyProps) {
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
    getItemKey: (index) => {
      const item = visualRows[index];
      return item.type === "row" ? item.row.id : item.row.id + "-details";
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
  }, [showOption, virtualizer]);

  return (
    <TableBody
      style={{ height: `${virtualizer.getTotalSize()}px` }}
      className="grid relative"
    >
      {rows.length ? (
        virtualizer.getVirtualItems().map(({ index, key, start }) => {
          const visualRow = visualRows[index];

          return visualRow.type === "row" ? (
            <TableRow
              key={key}
              style={{ transform: `translateY(${start}px)` }}
              className="flex absolute w-full"
              data-state={
                visualRow.row.getIsSelected()
                  ? "selected"
                  : visualRow.row.getIsExpanded()
                    ? "expanded"
                    : ""
              }
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
              <TableRow
                ref={virtualizer.measureElement} // Measure dynamic row height
                key={key}
                style={{ transform: `translateY(${start}px)` }}
                className="hover:bg-transparent flex absolute w-full"
                data-index={index} // Needed for dynamic row height measurement
              >
                <TableCell
                  colSpan={visualRow.row.getAllCells().length}
                  className="ml-6 border-l py-4 px-5 w-full flex flex-col gap-3"
                >
                  <TestPricingDetailsTable
                    id={visualRow.row.id}
                    columns={testPricingDetailsColumns}
                  />
                </TableCell>
              </TableRow>
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
}
