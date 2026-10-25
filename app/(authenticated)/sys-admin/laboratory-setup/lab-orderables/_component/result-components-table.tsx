"use client";

import CreateLisResultComponentDialogTrigger from "./lis-result-component-dialog/create-lis-result-component-dialog-trigger";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { columns } from "./columns/result-component-columns";
import { Spinner } from "@/components/ui/spinner";
import { ClientTable } from "@/components/ui/data-table/client-table";
import { useEffect, useState } from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useGetLisPerformableActionQuery } from "@/features/lis-performable/lis-performable.api";
import { Check, MoreHorizontal, RefreshCcw, X } from "lucide-react";
import { useUpdateLisResultComponentsOrderActionMutation } from "@/features/lis-result-component/lis-result-component.api";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ResultComponentsTable({
  performableId,
}: {
  performableId: string;
}) {
  // Server state
  const { data: performableData, isFetching } = useGetLisPerformableActionQuery(
    {
      id: performableId,
    },
  );
  const [updateLisResultComponentsOrderAction, { isLoading }] =
    useUpdateLisResultComponentsOrderActionMutation();

  const [data, setData] = useState(
    () => performableData?.data?.resultComponents ?? [],
  );

  const table = useReactTable({
    data,
    meta: {
      moveRow: (index: number, direction: "UP" | "DOWN") => {
        const targetIndex = direction === "UP" ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= data.length) return;

        const updatedData = [...data];

        [updatedData[index], updatedData[targetIndex]] = [
          updatedData[targetIndex],
          updatedData[index],
        ];

        setData(updatedData);
      },
    },
    columns,
    initialState: {
      columnVisibility: {
        order: false,
      },
    },
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    enableMultiRowSelection: false,
  });

  useEffect(() => {
    setData(performableData?.data?.resultComponents ?? []);
  }, [performableData]);

  async function handleSaveOrder() {
    const lisResultComponents = table
      .getRowModel()
      .rows.map((row) => ({ id: row.original.id, sortOrder: row.index + 1 }));

    try {
      await updateLisResultComponentsOrderAction({
        lisResultComponents,
      }).unwrap();
      table.getColumn("order")?.toggleVisibility(false);
      toast.success(`Result components order updated`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to update result components order`,
      );
    }
  }

  function handleCancel() {
    table.getColumn("order")?.toggleVisibility(false);
    setData(performableData?.data?.resultComponents ?? []);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h4 className="h-8 flex items-center text-sm font-semibold gap-1 min-w-0 mr-auto">
          <span className="truncate">Result Components</span>
          <span className="text-muted-foreground">({data.length})</span>
        </h4>
        {table.getColumn("order")?.getIsVisible() ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <div className="flex gap-1 items-center">
                <X />
                Cancel
              </div>
            </Button>
            <Button size="sm" onClick={handleSaveOrder}>
              {isLoading ? (
                <div className="flex gap-1 items-center">
                  <Spinner />
                  Saving...
                </div>
              ) : (
                <div className="flex gap-1 items-center">
                  <Check />
                  Save order
                </div>
              )}
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" title="More actions...">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" side="left" align="start">
              <DropdownMenuGroup>
                <CreateLisResultComponentDialogTrigger />
                <DropdownMenuItem disabled={data.length <= 0} asChild>
                  <button
                    onClick={() => {
                      table.getColumn("order")?.toggleVisibility(true);
                    }}
                    className="w-full gap-2"
                  >
                    <RefreshCcw /> Change Order
                  </button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {data.length == 0 ? (
        <div className="rounded-lg border border-border bg-card shadow-sm px-6 py-5">
          <p className="text-sm text-muted-foreground text-center">
            No result components yet. Add the first one to define what gets
            recorded for this test.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 min-h-[295px]">
          <ClientTable
            table={table}
            isLoading={isFetching}
            renderPagination={() => null}
          />
        </div>
      )}
    </div>
  );
}
