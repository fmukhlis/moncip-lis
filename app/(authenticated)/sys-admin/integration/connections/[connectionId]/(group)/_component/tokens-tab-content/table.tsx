"use client";

import CreateTokenDialog from "./create-token-dialog";
import RevokeTokenDialog from "./revoke-token-dialog";
import RotateTokenDialog from "./rotate-token-dialog";
import { Portal } from "radix-ui";
import { columns } from "./columns";
import { ClientTable } from "@/components/ui/data-table/client-table";
import { Clock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { useDebouncedCallback } from "use-debounce";
import { getPaginationRowModel } from "@tanstack/react-table";
import { useGetIntegrationConnectionActionQuery } from "@/features/integration-connection/integration-connection.api";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function TokensTabContent({ id }: { id: string }) {
  const { data: integrationConnectionData, isFetching } =
    useGetIntegrationConnectionActionQuery({ id });

  const { data } = useMemo(() => {
    const data = integrationConnectionData?.data?.tokens ?? [];

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
          <CreateTokenDialog connectionId={id} />
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
        <RevokeTokenDialog />
        <RotateTokenDialog />
      </Portal.Root>
    </>
  );
}
