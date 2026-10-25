"use client";

import { Portal } from "radix-ui";
import { useMemo } from "react";
import { ClientTable } from "@/components/ui/data-table/client-table";
import { getCoreRowModel } from "@tanstack/react-table";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { ConnectionStatusDialog } from "./connection-status-dialog";
import { connectionsColumns as columns } from "./connections-columns";
import { getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import { useGetIntegrationConnectionsActionQuery } from "@/features/integration-connection/integration-connection.api";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export default function ConnectionsTabContent() {
  const { data: integrationConnectionsData, isFetching } =
    useGetIntegrationConnectionsActionQuery({});

  const { data } = useMemo(() => {
    const data = integrationConnectionsData?.data ?? [];

    return { data };
  }, [integrationConnectionsData]);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableMultiRowSelection: false,
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Integration Connections</CardTitle>
          <CardDescription>
            HIS systems connected to this laboratory.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 min-h-[295px]">
            <ClientTable
              table={table}
              isLoading={isFetching}
              renderPagination={(table) => (
                <DataTablePagination
                  table={table}
                  isMultiSelectEnabled={false}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>
      <Portal.Root>
        <ConnectionStatusDialog />
      </Portal.Root>
    </>
  );
}
