"use client";

import RevokeCredentialDialog from "./revoke-credential-dialog";
import RotateCredentialDialog from "./rotate-credential-dialog";
import { Portal } from "radix-ui";
import { useMemo } from "react";
import { ClientTable } from "@/components/ui/data-table/client-table";
import { ShieldCheck } from "lucide-react";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { credentialsColumns as columns } from "./credentials-columns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetIntegrationCredentialsActionQuery } from "@/features/integration-credential/integration-credential.api";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export default function CredentialsTabContent() {
  const { data: integrationCredentialsData, isFetching } =
    useGetIntegrationCredentialsActionQuery({
      status: "ALL",
    });

  const { data } = useMemo(() => {
    const data = integrationCredentialsData?.data ?? [];

    return { data };
  }, [integrationCredentialsData]);

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
          <CardTitle>Integration Credentials</CardTitle>
          <CardDescription>
            Machine-to-machine authentication credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <ShieldCheck />
            <AlertTitle>Encrypted credential storage</AlertTitle>
            <AlertDescription>
              Credentials are encrypted at rest and securely used for outbound
              integrations.
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
        <RevokeCredentialDialog />
        <RotateCredentialDialog />
      </Portal.Root>
    </>
  );
}
