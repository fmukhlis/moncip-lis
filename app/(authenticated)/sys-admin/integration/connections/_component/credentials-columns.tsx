"use client";

import ClientDateTimeText from "@/components/ui/client-date-time-text";
import CredentialStatusBadge from "./credential-status-badge";
import ClientDistanceToNowText from "@/components/ui/client-distance-to-now-text";
import CredentialRowMoreAction from "./credential-row-more-action";
import { Badge } from "@/components/ui/badge";
import { IntegrationCredential } from "@/features/integration-credential/integration-credential.type";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<IntegrationCredential>();

export const credentialsColumns = [
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
  columnHelper.accessor("connection.name", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Conn. Name</div>
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
    size: 999,
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
    size: 150,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 flex justify-center",
    },
  }),
  columnHelper.display({
    id: "connectionStatus",
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Conn. Status</div>
    ),
    cell: ({ column, row }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <Badge
          variant={"outline"}
          className={
            row.original.connection.isActive
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
          }
        >
          {row.original.connection.isActive ? "ACTIVE" : "INACTIVE"}
        </Badge>
      </div>
    ),
    size: 150,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 flex justify-center",
    },
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
  }),
  columnHelper.display({
    id: "actions",
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Actions</div>
    ),
    cell: ({ column, row }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <CredentialRowMoreAction integrationCredential={row.original} />
      </div>
    ),
    size: 70,
    meta: {
      headerClassName: "w-full px-1.5 text-center",
      cellClassName: "w-full px-1.5 flex justify-center",
    },
  }),
] as ColumnDef<IntegrationCredential>[];
