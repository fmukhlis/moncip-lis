"use client";

import Barcode from "react-barcode";
import LabOrderStatusBadge from "../../_component/lab-order-status-badge";
import LabOrderPriorityBadge from "../../_component/lab-order-priority-badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { SpecimenStatus } from "@/generated/prisma";
import { useReactToPrint } from "react-to-print";
import { Card, CardHeader } from "@/components/ui/card";
import { MoreHorizontal, Printer } from "lucide-react";
import { useGetLabOrderActionQuery } from "@/features/lab-order/lab-order.api";
import { Fragment, JSX, useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function StickyHeader({ labOrderId }: { labOrderId: string }) {
  // Server state
  const { data, isFetching } = useGetLabOrderActionQuery({ id: labOrderId });

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({});

  const [isMounted, setIsMounted] = useState(false);
  const [printContent, setPrintContent] = useState<JSX.Element | null>(null);

  const order = data?.data;

  const reactToPrintContent = () => {
    return contentRef.current;
  };

  const handlePrintLabelClick = (o: NonNullable<typeof order>) => {
    setPrintContent(
      <>
        {o.specimens
          .filter(
            ({ status }) =>
              status !== SpecimenStatus.CANCELLED &&
              status !== SpecimenStatus.REJECTED,
          )
          .map(({ id, no, specimenType }) => (
            <Fragment key={id}>
              <div className="flex flex-col break-after-page p-1">
                <div className="flex gap-1 text-[10px]">
                  <span className="whitespace-nowrap">
                    MRN : <span className="">{o.patient.mrn}</span>
                  </span>
                  <span className="">|</span>
                  <span className="whitespace-nowrap">
                    DoB :{" "}
                    <span className="">
                      {o.patient.dateOfBirth
                        ? format(o.patient.dateOfBirth, "dd-MMM-yyyy")
                        : "—"}
                    </span>
                  </span>
                </div>
                <span className="font-semibold text-xs">{o.patient.name}</span>
                <Barcode
                  value={no}
                  height={20}
                  fontSize={7}
                  marginTop={3}
                  marginLeft={3}
                  marginRight={3}
                  marginBottom={3}
                  className="w-full shrink-0"
                />
                <div className="text-[10px] line-clamp-1 flex gap-1">
                  <span className="shrink-0">{specimenType.displayName}</span>
                  <span className="shrink-0">|</span>
                  <span className="truncate">
                    {format(new Date(), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
              </div>
            </Fragment>
          ))}
      </>,
    );
  };

  useEffect(() => {
    setIsMounted(true);
    if (isMounted && reactToPrintContent()) {
      reactToPrintFn(reactToPrintContent);
    }
  }, [printContent, isMounted, reactToPrintFn]);

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
                  handlePrintLabelClick(order);
                }}
                disabled={!order.specimens.length}
              >
                <Printer />
                Print Label
              </Button>
              <div className="hidden print:block">
                <div ref={contentRef} className="w-[50mm] h-[25mm]">
                  {printContent}
                </div>
              </div>
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
