"use client";

import { useMemo } from "react";
import { columns } from "./columns";
import { ClientTable } from "@/components/ui/data-table/client-table";
import { FlaskConical } from "lucide-react";
import { getPaginationRowModel } from "@tanstack/react-table";
import { useGetLabOrderActionQuery } from "@/features/lab-order/lab-order.api";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataTableLoadingWithoutPagination } from "@/components/ui/data-table/data-table-loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderItemsCard({ labOrderId }: { labOrderId: string }) {
  const { data: labOrderData, isFetching } = useGetLabOrderActionQuery({
    id: labOrderId,
  });

  const { data } = useMemo(() => {
    const data = labOrderData?.data?.items ?? [];

    return { data };
  }, [labOrderData]);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageSize: 20 } },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card>
      <CardHeader className="gap-0">
        <CardTitle className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <FlaskConical className="size-4" />
          Order Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <ClientTable
            table={table}
            isLoading={isFetching}
            renderLoading={(table) => (
              <DataTableLoadingWithoutPagination table={table} />
            )}
            renderPagination={() => null}
          />
        </div>
      </CardContent>
    </Card>
  );
}
