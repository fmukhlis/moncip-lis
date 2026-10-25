"use client";

import { Button } from "./button";
import { Skeleton } from "./skeleton";
import { Separator } from "./separator";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ClipboardList, RotateCcw } from "lucide-react";
import {
  Table,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  Row,
} from "@tanstack/react-table";
import {
  Table as TableRoot,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";

type TableState<TData> =
  | { type: "idle"; render?: React.ReactNode }
  | { type: "error"; render?: React.ReactNode }
  | { type: "loading"; render?: (table: Table<TData>) => React.ReactNode };

type TableOptions<TData> = Omit<
  Parameters<typeof useReactTable<TData>>[0],
  "getCoreRowModel" | "getPaginationRowModel"
>;

type ClientTableProps<TData> = {
  onRowClick?: (
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    row: Row<TData>,
  ) => void;
  tableState?: TableState<TData>;
  renderEmpty?: React.ReactNode;
  tableOptions: TableOptions<TData>;
};

function IdleState() {
  return (
    <div className="flex flex-col items-center justify-center border rounded-md px-5 py-[68px] text-center">
      <div className="bg-muted text-muted-foreground mb-3 flex size-11 items-center justify-center border">
        <ClipboardList className="size-5" />
      </div>
      <h3 className="text-base font-semibold">Nothing to show yet</h3>
      <p className="text-muted-foreground mt-1 max-w-md leading-6 text-sm">
        Enter search criteria or adjust the filters to display matching records.
      </p>
    </div>
  );
}

function LoadingState<TData>({ table }: { table: Table<TData> }) {
  return (
    <>
      <div className="overflow-hidden border rounded-md">
        <TableRoot>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        flex: header.getSize() === 999 ? 1 : "none",
                      }}
                    >
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
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {table.getVisibleLeafColumns().map((column) => {
                  return (
                    <TableCell
                      key={column.id}
                      style={{
                        width: column.getSize(),
                        flex: column.getSize() === 999 ? 1 : "none",
                      }}
                    >
                      <div className={column.columnDef.meta?.cellClassName}>
                        <Skeleton className="h-[18px] w-4/5 my-0.5" />
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      </div>
      <Separator />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-5 w-40" />
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <Skeleton className="h-5 w-16" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-[90px]" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center border rounded-md px-5 py-[68px] text-center">
      <div className="bg-muted text-muted-foreground mb-3 flex size-11 items-center justify-center border">
        <ClipboardList className="size-5" />
      </div>
      <h3 className="text-base font-semibold">Failed to load items</h3>
      <p className="text-muted-foreground mt-1 max-w-md leading-6 text-sm">
        An unexpected error occurred while retrieving items. Please try again.
      </p>
      <Button className="mt-3" disabled>
        <RotateCcw className="size-4" />
        Refresh
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center border rounded-md px-5 py-[68px] text-center">
      <div className="bg-muted text-muted-foreground mb-3 flex size-11 items-center justify-center border">
        <ClipboardList className="size-5" />
      </div>
      <h3 className="text-base font-semibold">No items found</h3>
      <p className="text-muted-foreground mt-1 max-w-md leading-6 text-sm">
        There are no items yet, or the current filters do not return any data.
      </p>
      <Button className="mt-3" disabled>
        <RotateCcw className="size-4" />
        Refresh
      </Button>
    </div>
  );
}

export function ClientTable<TData>({
  onRowClick,
  tableState,
  renderEmpty = <EmptyState />,
  tableOptions,
}: ClientTableProps<TData>) {
  const [hasMounted, setHasMounted] = useState(false);

  const table = useReactTable({
    ...tableOptions,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageSize = table.getState().pagination.pageSize;
  const pageIndex = table.getState().pagination.pageIndex;
  const totalCount = table.getRowCount();

  const end =
    totalCount === 0 ? 0 : Math.min(totalCount, (pageIndex + 1) * pageSize);
  const start = totalCount === 0 ? 0 : pageIndex * pageSize + 1;
  const totalPages = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize);

  useEffect(() => {
    setHasMounted(true);
  }, [setHasMounted]);

  if (tableState?.type === "idle") {
    return tableState?.render ? tableState.render : <IdleState />;
  }

  if (tableState?.type === "loading") {
    return tableState?.render ? (
      tableState.render?.(table)
    ) : (
      <LoadingState table={table} />
    );
  }

  if (tableState?.type === "error") {
    return tableState?.render ? tableState.render : <ErrorState />;
  }

  if (!totalCount && hasMounted) {
    return renderEmpty;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div className="overflow-hidden border rounded-md">
          <TableRoot>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{
                          width: header.getSize(),
                        }}
                      >
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
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={(e) => {
                      onRowClick?.(e, row);
                    }}
                    className={`${onRowClick ? "cursor-pointer" : ""}`}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        style={{
                          width: cell.column.getSize(),
                        }}
                        key={cell.id}
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
                <TableRow>
                  <TableCell
                    className="h-[160px]"
                    colSpan={table.getAllColumns().length}
                  ></TableCell>
                </TableRow>
              )}
            </TableBody>
          </TableRoot>
        </div>
      </div>
      <Separator className="mb-auto" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-center sm:text-start text-sm">
          Showing {start}-{end} of {totalCount} items
        </p>
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            Page {pageIndex + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                table.previousPage();
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                table.nextPage();
              }}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
