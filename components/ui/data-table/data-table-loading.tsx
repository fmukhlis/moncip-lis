import { Skeleton } from "../skeleton";
import { Separator } from "../separator";
import { flexRender } from "@tanstack/react-table";
import {
  Table as TableRoot,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../table";
import { type Table } from "@tanstack/react-table";

interface DataTableLoadingProps<TData> {
  table: Table<TData>;
}

export function DataTableLoading<TData>({
  table,
}: DataTableLoadingProps<TData>) {
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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2">
        <div className="flex items-center justify-between">
          <Skeleton className="w-[90px] h-5" />
          <div className="flex items-center space-x-6 lg:space-x-8 min-w-0">
            <div className="flex items-center space-x-2 min-w-0">
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-9 w-[50px]" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-[100px]" />
          <div className="flex items-center gap-2">
            <Skeleton className="hidden size-8 lg:flex" />
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
            <Skeleton className="hidden size-8 lg:flex" />
          </div>
        </div>
      </div>
    </>
  );
}

export function DataTableLoadingWithoutPagination<TData>({
  table,
}: DataTableLoadingProps<TData>) {
  return (
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
  );
}
