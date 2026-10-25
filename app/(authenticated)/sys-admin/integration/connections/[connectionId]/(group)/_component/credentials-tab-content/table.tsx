"use client";

import CreateCredentialDialog from "./create-credential-dialog";
import RevokeCredentialDialog from "./revoke-credential-dialog";
import RotateCredentialDialog from "./rotate-credential-dialog";
import { Portal } from "radix-ui";
import { columns } from "./columns";
import { ClientTable } from "@/components/ui/data-table/client-table";
import { Clock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { useDebouncedCallback } from "use-debounce";
import { useGetIntegrationConnectionActionQuery } from "@/features/integration-connection/integration-connection.api";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

export default function CredentialsTabContent({ id }: { id: string }) {
  const { data: integrationConnectionData, isFetching } =
    useGetIntegrationConnectionActionQuery({ id });

  const { data } = useMemo(() => {
    const data = integrationConnectionData?.data?.credentials ?? [];

    return { data };
  }, [integrationConnectionData]);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageSize: 5 } },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableMultiRowSelection: false,
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  const [isTyping, setIsTyping] = useState(false);

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setIsTyping(false);
    table.setGlobalFilter(value);
  }, 500);

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <InputGroup>
            <InputGroupInput
              placeholder="Search..."
              onChange={(e) => {
                setIsTyping(true);
                handleSearchChange(e.target.value);
              }}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              {isTyping ? (
                <Clock className="animate-pulse" />
              ) : (
                <>{filteredCount} results</>
              )}
            </InputGroupAddon>
          </InputGroup>
          <CreateCredentialDialog connectionId={id} />
        </div>
        <div className="flex flex-col gap-2 min-h-[295px]">
          <ClientTable
            table={table}
            isLoading={isFetching}
            renderPagination={(table) => (
              <DataTablePagination table={table} isMultiSelectEnabled={false} />
            )}
          />
        </div>
      </div>
      <Portal.Root>
        <RevokeCredentialDialog />
        <RotateCredentialDialog />
      </Portal.Root>
    </>
  );
}
