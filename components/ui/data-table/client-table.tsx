"use client";

import { useEffect, useState } from "react";
import { Row, Table, flexRender } from "@tanstack/react-table";
import {
  Table as TableRoot,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { DataTableIdle } from "./data-table-idle";
import { DataTableEmpty1 } from "./data-table-empty";
import { DataTableError1 } from "./data-table-error";
import { DataTableLoading } from "./data-table-loading";
import { DataTablePagination } from "./data-table-pagination";

type ClientTableProps<TData> = {
  table: Table<TData>;
  isIdle?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  renderIdle?: (table: Table<TData>) => React.ReactNode;
  renderEmpty?: (table: Table<TData>) => React.ReactNode;
  renderError?: (table: Table<TData>) => React.ReactNode;
  renderLoading?: (table: Table<TData>) => React.ReactNode;
  onBodyRowClick?: (
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    row: Row<TData>,
  ) => void;
  renderPagination?: (table: Table<TData>) => React.ReactNode;
};

export function ClientTable<TData>({
  table,
  isIdle = false,
  isError = false,
  isLoading = false,
  renderIdle = () => <DataTableIdle />,
  renderEmpty = () => <DataTableEmpty1 />,
  renderError = () => <DataTableError1 />,
  renderLoading = (table) => <DataTableLoading table={table} />,
  onBodyRowClick,
  renderPagination = (table) => <DataTablePagination table={table} />,
}: ClientTableProps<TData>) {
  // These lines of code are to prevent hydration mismatch error (ERR01)
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, [setHasMounted]);
  // ---> (ERR01)

  if (isLoading) {
    return renderLoading(table);
  }

  if (isError) {
    return renderError(table);
  }

  if (isIdle) {
    return renderIdle(table);
  }

  if (table.getFilteredRowModel().rows.length === 0 || !hasMounted) {
    return renderEmpty(table);
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
                      onBodyRowClick?.(e, row);
                    }}
                    className={`${onBodyRowClick ? "cursor-pointer" : ""}`}
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
      {renderPagination(table)}
    </>
  );
}
