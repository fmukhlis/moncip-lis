"use client";

import RowMoreAction from "./row-more-action";
import ClientDateTimeText from "@/components/ui/client-date-time-text";
import CredentialStatusBadge from "../../../../_component/credential-status-badge";
import ClientDistanceToNowText from "@/components/ui/client-distance-to-now-text";
import { IntegrationConnectionDetail } from "@/features/integration-connection/integration-connection.type";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper =
  createColumnHelper<IntegrationConnectionDetail["credentials"][number]>();

export const columns = [
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Name</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>{getValue()}</div>
    ),
    size: 200,
    meta: {
      headerClassName: "w-full px-1.5",
      cellClassName: "w-full px-1.5",
    },
  }),
  columnHelper.accessor("secretPrefix", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Prefix</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <div className="flex items-center gap-1">
          <code className="text-xs rounded bg-muted px-1.5 py-0.5 break-all font-mono">
            {getValue()}••••
          </code>
        </div>
      </div>
    ),
    size: 300,
    meta: {
      headerClassName: "w-full px-1.5",
      cellClassName: "w-full px-1.5",
    },
  }),
  columnHelper.display({
    id: "status",
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Status</div>
    ),
    cell: ({ column, row }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <CredentialStatusBadge
          expiresAt={row.original.expiresAt}
          revokedAt={row.original.revokedAt}
        />
      </div>
    ),
    size: 100,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 flex justify-center",
    },
    enableGlobalFilter: false,
  }),
  columnHelper.accessor("expiresAt", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Expires</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <ClientDateTimeText
          formatStr="dd MMM yyyy, HH:mm"
          dateTime={getValue()}
        />
      </div>
    ),
    size: 150,
    meta: {
      headerClassName: "w-full px-1.5",
      cellClassName: "w-full px-1.5",
    },
    enableGlobalFilter: false,
  }),
  columnHelper.accessor("lastUsedAt", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Last Used</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <ClientDistanceToNowText dateTime={getValue()} />
      </div>
    ),
    size: 150,
    meta: {
      headerClassName: "w-full px-1.5",
      cellClassName: "w-full px-1.5",
    },
    enableGlobalFilter: false,
  }),
  columnHelper.accessor("createdAt", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Created</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <ClientDateTimeText
          formatStr="dd MMM yyyy, HH:mm"
          dateTime={getValue()}
        />
      </div>
    ),
    size: 150,
    meta: {
      headerClassName: "w-full px-1.5",
      cellClassName: "w-full px-1.5",
    },
    enableGlobalFilter: false,
  }),
  columnHelper.display({
    id: "actions",
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Actions</div>
    ),
    cell: ({ column, row }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <RowMoreAction credential={row.original} />
      </div>
    ),
    size: 70,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 flex justify-center",
    },
  }),
] as ColumnDef<IntegrationConnectionDetail["credentials"][number]>[];
