"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowLeft, ArrowRight, ClipboardList, RotateCcw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  Table as TableRoot,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./button";
import { Separator } from "./separator";
import { Skeleton } from "./skeleton";

type TableState =
  | { type: "idle"; render?: React.ReactNode }
  | { type: "error"; render?: React.ReactNode }
  | { type: "loading"; render?: React.ReactNode };

interface ServerTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  tableState?: TableState;
  renderEmpty?: React.ReactNode;
  paginationMeta: {
    page: number;
    total: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

function IdleState() {
  return (
    <div className="flex flex-col items-center justify-center border px-5 py-[52px] text-center">
      <div className="bg-muted text-muted-foreground mb-3 flex size-11 items-center justify-center border">
        <ClipboardList className="size-5" />
      </div>
      <h3 className="text-base font-semibold">Nothing to show yet</h3>
      <p className="text-muted-foreground mt-2 max-w-md leading-6">
        Enter search criteria or adjust the filters to display matching records.
      </p>
    </div>
  );
}

function LoadingState<TData>({ table }: { table: Table<TData> }) {
  return (
    <>
      <div className="overflow-hidden border">
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
                        <Skeleton className="h-4 w-4/5" />
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
        <Skeleton className="h-4 w-40" />
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <Skeleton className="h-4 w-16" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-[90px]" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    </>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center border px-5 py-[52px] text-center">
      <div className="bg-muted text-muted-foreground mb-3 flex size-11 items-center justify-center border">
        <ClipboardList className="size-5" />
      </div>
      <h3 className="text-base font-semibold">Failed to load items</h3>
      <p className="text-muted-foreground mt-2 max-w-md leading-6">
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
    <div className="flex flex-col items-center justify-center border px-5 py-[52px] text-center">
      <div className="bg-muted text-muted-foreground mb-3 flex size-11 items-center justify-center border">
        <ClipboardList className="size-5" />
      </div>
      <h3 className="text-base font-semibold">No items found</h3>
      <p className="text-muted-foreground mt-2 max-w-md leading-6">
        There are no items yet, or the current filters do not return any data.
      </p>
      <Button className="mt-3" disabled>
        <RotateCcw className="size-4" />
        Refresh
      </Button>
    </div>
  );
}

export function ServerTable<TData, TValue>({
  data,
  columns,
  tableState,
  renderEmpty = <EmptyState />,
  paginationMeta: { page, total, pageSize, hasNextPage, hasPreviousPage },
}: ServerTableProps<TData, TValue>) {
  const [hasMounted, setHasMounted] = useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const end = total === 0 ? 1 : Math.min(page * pageSize, total);
  const start = total === 0 ? 1 : (page - 1) * pageSize + 1;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);

  useEffect(() => {
    setHasMounted(true);
  }, [setHasMounted]);

  if (tableState?.type === "idle") {
    return tableState?.render ? tableState.render : <IdleState />;
  }

  if (tableState?.type === "loading") {
    return tableState?.render ? (
      tableState.render
    ) : (
      <LoadingState table={table} />
    );
  }

  if (tableState?.type === "error") {
    return tableState?.render ? tableState.render : <ErrorState />;
  }

  if (!total && hasMounted) {
    return renderEmpty;
  }

  function updateUrl(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(next)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div className="overflow-hidden border">
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
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        style={{
                          width: cell.column.getSize(),
                          flex: cell.column.getSize() === 999 ? 1 : "none",
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
      <Separator />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-center sm:text-start">
          Showing {start}-{end} of {total} lab orders
        </p>
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <p className="text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                updateUrl({ page: String(page - 1) });
              }}
              disabled={!hasPreviousPage}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                updateUrl({ page: String(page + 1) });
              }}
              disabled={!hasNextPage}
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
