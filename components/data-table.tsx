"use client";

import React from "react";
import CreateUserForm from "./user/create-user-form";

import type {
  SortingState,
  PaginationState,
  ColumnFiltersState,
} from "@tanstack/react-table";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { X, ArrowBigLeft, ArrowBigRight, EllipsisVertical } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "./ui/table";

type DataTableProps<TData, TValue> = {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
};

export function DataTableForCard<TData, TValue>({
  data,
  columns,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageSize: 5,
    pageIndex: 0,
  });
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "name",
      desc: false,
    },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const table = useReactTable({
    data,
    state: {
      sorting,
      pagination,
      columnFilters,
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <div className="flex items-center pb-5 gap-3">
        <Input
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          placeholder="Search user's name..."
        />
        <Button
          size={"icon"}
          variant={"outline"}
          onClick={() => {
            table.getColumn("name")?.setFilterValue(undefined);
          }}
          disabled={!table.getColumn("name")?.getFilterValue()}
        >
          <span className="sr-only">Clear filters</span>
          <X />
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-secondary">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-background">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <>
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-[243px]">
                    <div className="text-center text-muted-foreground">
                      No results.
                    </div>
                  </TableCell>
                </TableRow>
              </>
            )}
            {table.getRowModel().rows.length
              ? table.getRowModel().rows.length < 5 &&
                Array.from(
                  { length: 5 - table.getRowModel().rows.length },
                  (_, i) => (
                    <TableRow
                      key={`${i}`}
                      className="pointer-events-none opacity-70"
                    >
                      <TableCell>
                        <div className="ml-1.5 h-6 w-[186px] rounded-md bg-muted"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-20 rounded-md bg-muted"></div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          disabled
                          className="size-8 flex"
                        >
                          <EllipsisVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ),
                )
              : null}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center pt-5 gap-3">
        <CreateUserForm />
        <Button
          variant={"secondary"}
          onClick={() => {
            table.previousPage();
          }}
          disabled={!table.getCanPreviousPage()}
          className="w-[90px] ml-auto"
        >
          <ArrowBigLeft />
          Prev
        </Button>
        <Button
          variant={"secondary"}
          onClick={() => {
            table.nextPage();
          }}
          disabled={!table.getCanNextPage()}
          className="w-[90px] -auto"
        >
          Next
          <ArrowBigRight />
        </Button>
      </div>
    </>
  );
}
