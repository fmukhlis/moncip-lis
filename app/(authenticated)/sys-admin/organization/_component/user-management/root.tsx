"use client";

import TableFilter from "./table-filter";
import EditUserDialog from "./edit-user-dialog";
import CreateUserDialog from "./create-user-dialog";
import CreateUserDialogTrigger from "./create-user-dialog-trigger";
import { Portal } from "radix-ui";
import { columns } from "./columns";
import { useMemo } from "react";
import { ClientTable } from "@/components/ui/data-table/client-table";
import { DeleteUserDialog } from "./delete-user-dialog";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { useGetUsersActionQuery } from "@/features/user/user.api";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import {
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Card,
  CardTitle,
  CardAction,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export default function UserManagementCard() {
  const { data: usersData, isFetching: isFetchingUsers } =
    useGetUsersActionQuery({});

  const { data } = useMemo(() => {
    const data = usersData?.data ?? [];

    return { data };
  }, [usersData]);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableMultiRowSelection: false,
  });

  return (
    <>
      <Card className="sm:col-span-3 min-w-0">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and department assignments.
          </CardDescription>
          <CardAction>
            <CreateUserDialogTrigger />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <TableFilter table={table} />
            <div className="flex flex-col gap-2">
              <ClientTable
                table={table}
                isLoading={isFetchingUsers}
                renderPagination={(table) => (
                  <DataTablePagination
                    table={table}
                    isMultiSelectEnabled={false}
                  />
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Portal.Root>
        <CreateUserDialog />
        <EditUserDialog
          user={table.getSelectedRowModel().rows.at(0)?.original ?? null}
        />
        <DeleteUserDialog
          user={table.getSelectedRowModel().rows.at(0)?.original ?? null}
        />
      </Portal.Root>
    </>
  );
}
