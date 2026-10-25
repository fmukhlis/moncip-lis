"use client";

import ClientDateTimeText from "@/components/ui/client-date-time-text";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ClipboardList } from "lucide-react";
import { InfoRow, InfoRowSkeleton } from "./info-row";
import { useGetLabOrderActionQuery } from "@/features/lab-order/lab-order.api";
import { PRIORITY_LABEL, STATUS_LABEL } from "../../_component/labels";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";

export default function OrderCard({ labOrderId }: { labOrderId: string }) {
  const { data, isFetching } = useGetLabOrderActionQuery({ id: labOrderId });

  const order = data?.data;

  const completedItems = order?.items.filter(
    ({ status }) => status === "VERIFIED",
  ).length;

  return (
    <Card>
      {isFetching || !order ? (
        <>
          <CardHeader className="gap-0">
            <CardTitle className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <ClipboardList className="size-4" />
              Order Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-x-3 gap-y-2">
              <InfoRowSkeleton label="Priority" />
              <InfoRowSkeleton label="Status" />
            </div>
            <InfoRowSkeleton label="Ordered at" />
            <Separator />
            <Skeleton className="h-9" />
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className="gap-0">
            <CardTitle className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <ClipboardList className="size-4" />
              Order Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-x-3 gap-y-2">
              <InfoRow
                label="Priority"
                value={PRIORITY_LABEL[order.priority]}
              />
              <InfoRow label="Status" value={STATUS_LABEL[order.status]} />
            </div>
            <InfoRow
              label="Ordered at"
              value={
                <ClientDateTimeText
                  dateTime={order.orderedAt}
                  formatStr="dd MMM yyyy, HH:mm"
                />
              }
            />
            <Separator />
            <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-sm font-bold tabular-nums">
                {completedItems}
                <span className="font-normal text-muted-foreground">
                  /{order.items.length}
                </span>
              </span>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}
