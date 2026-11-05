"use client";

import LabOrderStatusBadge from "@/app/(authenticated)/_component/lab-orders/lab-order-status-badge";
import LabOrderPriorityBadge from "@/app/(authenticated)/_component/lab-orders/lab-order-priority-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader } from "@/components/ui/card";
import { MoreHorizontal, Printer } from "lucide-react";
import { useGetLabOrderActionQuery } from "@/features/lab-order/lab-order.api";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePrintLabOrderLabel } from "./use-print-lab-order-label";

export default function StickyHeader({ labOrderId }: { labOrderId: string }) {
  // Server state
  const { data, isFetching } = useGetLabOrderActionQuery({ id: labOrderId });

  // The label markup and the print plumbing live in the shared hook, so the
  // specimen assignment worklist prints exactly the same label.
  const { printLabel, printPortal } = usePrintLabOrderLabel();

  const order = data?.data;

  return (
    <Card className="sticky -top-2 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-none border-0 border-y rounded-none">
      {isFetching || !order ? (
        <CardHeader className="gap-0">
          <div className="min-w-0 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="w-60 h-6" />
              <div className="flex gap-2">
                <Skeleton className="w-14 h-5" />
                <Skeleton className="w-14 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <Printer />
                Print Label
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      ) : (
        <CardHeader className="gap-0">
          <div className="min-w-0 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg truncate tracking-tight leading-none">
                Lab Order&nbsp;#{order.no}
              </h2>
              <div className="space-x-2">
                <LabOrderStatusBadge status={order.status} />
                <LabOrderPriorityBadge priority={order.priority} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  printLabel(order);
                }}
                disabled={!order.specimens.length}
              >
                <Printer />
                Print Label
              </Button>
              {printPortal}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More actions</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>More actions</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
      )}
    </Card>
  );
}
