"use client";

import TableFilter from "./table-filter";
import EditDepartmentDialog from "./edit-department-dialog";
import CreateDepartmentDialog from "./create-department-dialog";
import CreateDepartmentDialogTrigger from "./create-department-dialog-trigger";
import DepartmentItemCard, {
  DepartmentItemCardSkeleton,
} from "./department-item-card";
import { toast } from "sonner";
import { Portal } from "radix-ui";
import { columns } from "./department-columns";
import { useMemo } from "react";
import { ClipboardList } from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { getFilteredRowModel } from "@tanstack/react-table";
import { setIsEditDepartmentDialogOpen } from "../../slice";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import {
  useGetDepartmentsActionQuery,
  useUpdateDepartmentActionMutation,
} from "@/features/department/department.api";
import {
  Card,
  CardTitle,
  CardAction,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export default function DepartmentManagementCard() {
  const { data: departmentsData, isFetching } = useGetDepartmentsActionQuery(
    {},
  );

  const { data } = useMemo(() => {
    const data = departmentsData?.data ?? [];

    return { data };
  }, [departmentsData]);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableMultiRowSelection: false,
  });

  const [updateDepartmentAction, { isLoading }] =
    useUpdateDepartmentActionMutation();

  const dispatch = useAppDispatch();

  const selectedRow = table.getSelectedRowModel().rows.at(0)?.original ?? null;

  const handleEdit = () => {
    dispatch(setIsEditDepartmentDialogOpen(true));
  };

  const handleToggleActive = async () => {
    if (!selectedRow || isLoading) {
      return;
    }

    const res = await updateDepartmentAction({
      id: selectedRow.id,
      isActive: !selectedRow.isActive,
      description: selectedRow.description,
    }).unwrap();

    toast.success(`Department "${res?.data?.displayName}" updated`);
  };

  return (
    <>
      <Card className="sm:col-span-2">
        <CardHeader>
          <CardTitle>Department Management</CardTitle>
          <CardDescription>
            Manage departments used for user assignments.
          </CardDescription>
          <CardAction>
            <CreateDepartmentDialogTrigger />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <TableFilter table={table} />
            <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
              {isFetching ? (
                <>
                  <DepartmentItemCardSkeleton />
                  <DepartmentItemCardSkeleton />
                  <DepartmentItemCardSkeleton />
                </>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <DepartmentItemCard
                    key={row.id}
                    onEdit={handleEdit}
                    department={row.original}
                    onOpenMenu={() => {
                      row.toggleSelected(true);
                    }}
                    onToggleActive={handleToggleActive}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center border rounded-md p-7 text-center">
                  <div className="bg-muted text-muted-foreground mb-3 flex size-11 items-center justify-center border">
                    <ClipboardList className="size-5" />
                  </div>
                  <h3 className="text-sm font-semibold">No items found</h3>
                  <p className="text-muted-foreground mt-1 max-w-md leading-6 text-sm">
                    There are no items yet, or the current filters do not return
                    any data.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Portal.Root>
        <CreateDepartmentDialog />
        <EditDepartmentDialog
          department={table.getSelectedRowModel().rows.at(0)?.original ?? null}
        />
      </Portal.Root>
    </>
  );
}
