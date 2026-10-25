"use client";

import ConnectionRowMoreAction from "./connection-row-more-action";
import { Badge } from "@/components/ui/badge";
import { IntegrationConnection } from "@/features/integration-connection/integration-connection.type";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<IntegrationConnection>();

export const connectionsColumns = [
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Name</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>{getValue()}</div>
    ),
    size: 999,
    meta: {
      headerClassName: "w-full px-1.5",
      cellClassName: "w-full px-1.5",
    },
  }),
  columnHelper.accessor("sourceSystem", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>
        Source System
      </div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <Badge variant="secondary">{getValue()}</Badge>
      </div>
    ),
    size: 150,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 flex justify-center",
    },
  }),
  columnHelper.accessor("isActive", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Status</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        {getValue() ? (
          <Badge
            variant={"outline"}
            className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
          >
            Active
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            Inactive
          </Badge>
        )}
      </div>
    ),
    size: 100,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 flex justify-center",
    },
  }),
  columnHelper.accessor("type", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Type</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <Badge variant={"outline"}>{getValue()}</Badge>
      </div>
    ),
    size: 100,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5  flex justify-center",
    },
  }),
  columnHelper.accessor("_count.tokens", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Tokens</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>{getValue()}</div>
    ),
    size: 70,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 flex justify-center",
    },
  }),
  columnHelper.accessor("_count.credentials", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Credentials</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>{getValue()}</div>
    ),
    size: 70,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 flex justify-center",
    },
  }),
  columnHelper.accessor("baseUrl", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Base URL</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>{getValue()}</div>
    ),
    size: 999,
    meta: {
      headerClassName: "w-full px-1.5",
      cellClassName: "w-full px-1.5",
    },
  }),
  columnHelper.display({
    id: "actions",
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Actions</div>
    ),
    cell: ({ column, row }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <ConnectionRowMoreAction integrationConnection={row.original} />
      </div>
    ),
    size: 70,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 flex justify-center",
    },
  }),
] as ColumnDef<IntegrationConnection>[];
