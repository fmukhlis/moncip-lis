"use client";

import RevokeTokenDialog from "./revoke-token-dialog";
import RotateTokenDialog from "./rotate-token-dialog";
import { Portal } from "radix-ui";
import { useMemo } from "react";
import { ClientTable } from "@/components/ui/data-table/client-table";
import { ShieldCheckIcon } from "lucide-react";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { getPaginationRowModel } from "@tanstack/react-table";
import { tokensColumns as columns } from "./tokens-columns";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useGetIntegrationTokensActionQuery } from "@/features/integration-token/integration-token.api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export default function TokensTabContent() {
  const { data: tokenData, isFetching } = useGetIntegrationTokensActionQuery({
    status: "ALL",
  });

  const { data } = useMemo(() => {
    const data = tokenData?.data ?? [];

    return { data };
  }, [tokenData]);

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
          <CardTitle>Integration Tokens</CardTitle>
          <CardDescription>
            Machine-to-machine authentication tokens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <ShieldCheckIcon />
            <AlertTitle>Secure token storage</AlertTitle>
            <AlertDescription>
              Tokens are only shown once during creation and stored as hashes.
            </AlertDescription>
          </Alert>
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
        <RevokeTokenDialog />
        <RotateTokenDialog />
      </Portal.Root>
    </>
  );
}
