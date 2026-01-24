"use client";

import React from "react";

import { Spinner } from "@/components/ui/spinner";
import { LocalTest } from "@/features/master-data/type/test-pricing";
import { DollarSign } from "lucide-react";
import { useGetLocalTestQuery } from "@/features/master-data/api/serverFunction";
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

type TestPricingDetailsTableProps = {
  id: string;
  columns: ColumnDef<NonNullable<LocalTest>["prices"][number]>[];
};

export default function TestPricingDetailsTable({
  id,
  columns,
}: TestPricingDetailsTableProps) {
  const { data, isLoading } = useGetLocalTestQuery({ id });

  const localTest = data?.data;

  const table = useReactTable({
    data: localTest ? localTest.prices : [],
    columns,
    getRowId: ({ id }) => id,
    initialState: {
      sorting: [{ id: "validFrom", desc: true }],
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      {isLoading ? (
        <div className="flex items-center gap-3">
          <Spinner className="size-5" color="var(--muted-foreground)" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      ) : (
        <>
          <h4 className="font-semibold flex gap-2 items-center">
            <DollarSign className="size-5" />
            Pricing Details
          </h4>
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
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
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
        </>
      )}
    </>
  );
}
