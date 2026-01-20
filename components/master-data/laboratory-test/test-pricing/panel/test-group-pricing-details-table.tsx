"use client";

import React from "react";

import { LocalTestGroup } from "@/features/master-data/type/test-pricing";
import {
  ColumnDef,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";

type TestGroupPricingDetailsTableProps = {
  localTestGroup: LocalTestGroup | undefined;
  columns: ColumnDef<NonNullable<LocalTestGroup>["prices"][number]>[];
};

export default function TestGroupPricingDetailsTable({
  localTestGroup,
  columns,
}: TestGroupPricingDetailsTableProps) {
  const table = useReactTable({
    data: localTestGroup ? localTestGroup.prices : [],
    columns,
    getRowId: ({ id }) => id,
    initialState: {
      sorting: [{ id: "validFrom", desc: true }],
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-hidden border">
      <Table className="grid">
        <TableHeader className="grid">
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
        <TableBody className="grid">
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="flex w-full">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      flex: cell.column.getSize() > 300 ? 1 : "none",
                    }}
                    className="h-11 flex items-center"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="flex w-full">
              <TableCell colSpan={columns.length} className="w-full">
                <div className="text-center text-muted-foreground w-full">
                  No results.
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
