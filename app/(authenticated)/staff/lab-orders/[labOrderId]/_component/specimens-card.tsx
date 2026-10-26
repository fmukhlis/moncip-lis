"use client";

import ClientDateTimeText from "@/components/ui/client-date-time-text";
import SpecimenStatusBadge from "./specimen-status-badge";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch } from "@/hooks";
import { InfoRow, InfoRowSkeleton } from "./info-row";
import { useLabOrderDetailContext } from "../context";
import { useGetLabOrderActionQuery } from "@/features/lab-order/lab-order.api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  SpecimenStatus,
  SpecimenAssignmentEndReason,
} from "@/generated/prisma";
import {
  Plus,
  Trash2,
  SquarePen,
  TestTubes,
  CheckCheck,
  ClipboardClock,
} from "lucide-react";
import {
  setSelectedSpecimenId,
  setIsEditSpecimenDialogOpen,
  setIsCreateSpecimenDialogOpen,
  setIsCancelSpecimenDialogOpen,
} from "../slice";
import {
  Card,
  CardTitle,
  CardAction,
  CardHeader,
  CardContent,
} from "@/components/ui/card";

export default function SpecimensCard({ labOrderId }: { labOrderId: string }) {
  // Server state
  const { data, isFetching } = useGetLabOrderActionQuery({
    id: labOrderId,
  });

  // Global state
  const dispatch = useAppDispatch();

  const {
    setEditSpecimenDialogTrigger,
    setCancelSpecimenDialogTrigger,
    setCreateSpecimenDialogTrigger,
  } = useLabOrderDetailContext();

  const [isShowingAll, setIsShowingAll] = useState(false);

  const order = data?.data;
  const specimens = data?.data?.specimens.filter(
    ({ status }) =>
      isShowingAll ||
      (status !== SpecimenStatus.CANCELLED &&
        status !== SpecimenStatus.REJECTED),
  );

  return (
    <Card>
      <CardHeader className="gap-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <TestTubes className="size-4" />
            Specimens
          </CardTitle>
          <CardAction>
            <Toggle
              size="xs"
              pressed={isShowingAll}
              className="size-5 min-w-5 mr-2 text-muted-foreground"
              aria-label="Toggle active items only filter"
              onPressedChange={setIsShowingAll}
            >
              <CheckCheck className="size-3.5" />
            </Toggle>
            {/* <Button size={"icon-sm"} variant={"secondary"}>
              {!isShowingAll ? (
                <>
                  <Eye />
                  <span>Show all</span>
                </>
              ) : (
                <>
                  <EyeOff />
                  <span>Show active only</span>
                </>
              )}
            </Button> */}
            <Button
              size={"icon-sm"}
              onClick={(e) => {
                dispatch(setIsCreateSpecimenDialogOpen(true));
                setCreateSpecimenDialogTrigger(e.currentTarget);
              }}
              // Specimen creation is no longer allowed if all order items already have an active specimen.
              disabled={order?.items.every(({ specimens }) =>
                specimens.some(({ endedAt }) => !endedAt),
              )}
              className="size-5"
            >
              <Plus />
              <span className="sr-only">Create specimen</span>
            </Button>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isFetching || !specimens ? (
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="w-28 h-4" />
              </div>
              <Skeleton className="w-28 h-4" />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <InfoRowSkeleton label="Collection Time" />
              <InfoRowSkeleton label="Received Time" />
              <div className="col-span-2">
                <InfoRowSkeleton label="Assigned to:" />
              </div>
            </div>
          </div>
        ) : specimens.length === 0 ? (
          <div className="flex flex-col items-center justify-center border rounded-md p-5 text-center">
            <div className="bg-muted text-muted-foreground mb-3 flex size-[41px] items-center justify-center border">
              <TestTubes className="size-5" />
            </div>
            <h3 className="text-base font-semibold">
              No active specimens found
            </h3>
            <p className="text-muted-foreground mt-1 max-w-md leading-6 text-sm">
              There are no active specimens associated with this lab order.
            </p>
          </div>
        ) : (
          specimens.map((specimen) => (
            <div
              key={specimen.id}
              className={cn(
                "rounded-md border bg-muted/30 p-3",
                specimen.status === SpecimenStatus.CANCELLED ||
                  specimen.status === SpecimenStatus.REJECTED
                  ? "opacity-60"
                  : "",
              )}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold">
                    {specimen.specimenType.displayName}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <SpecimenStatusBadge status={specimen.status} />
                  {specimen.status !== SpecimenStatus.CANCELLED &&
                  specimen.status !== SpecimenStatus.REJECTED ? (
                    <>
                      <Button
                        size={"icon-sm"}
                        variant="ghost"
                        className="size-6"
                        onClick={(e) => {
                          dispatch(setSelectedSpecimenId(specimen.id));
                          dispatch(setIsEditSpecimenDialogOpen(true));
                          setEditSpecimenDialogTrigger(e.currentTarget);
                        }}
                      >
                        <SquarePen className="size-3.5" />
                        <span className="sr-only">
                          Edit specimen {specimen.specimenType.displayName}
                        </span>
                      </Button>
                      <Button
                        size={"icon-sm"}
                        variant="ghost"
                        className="size-6 text-destructive hover:bg-destructive/25 dark:hover:bg-destructive/50"
                        onClick={(e) => {
                          dispatch(setSelectedSpecimenId(specimen.id));
                          dispatch(setIsCancelSpecimenDialogOpen(true));
                          setCancelSpecimenDialogTrigger(e.currentTarget);
                        }}
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">
                          Cancel specimen {specimen.specimenType.displayName}
                        </span>
                      </Button>
                      <Button
                        size={"icon-sm"}
                        variant="ghost"
                        className="size-6 ml-auto"
                      >
                        <ClipboardClock className="size-4" />
                        <span className="sr-only">
                          Log collection time for specimen{" "}
                          {specimen.specimenType.displayName}
                        </span>
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <InfoRow
                  label="Collection Time"
                  value={
                    <ClientDateTimeText
                      formatStr="dd MMM yyyy, HH:mm"
                      dateTime={specimen.collectedAt}
                    />
                  }
                />
                <InfoRow
                  label="Received Time"
                  value={
                    <ClientDateTimeText
                      formatStr="dd MMM yyyy, HH:mm"
                      dateTime={specimen.receivedAt}
                    />
                  }
                />
                <div className="col-span-2">
                  <InfoRow
                    label="Assigned to:"
                    value={
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {specimen.orderItems.length
                          ? specimen.orderItems
                              .filter(
                                ({ endedAt, endReason }) =>
                                  (specimen.status ===
                                    SpecimenStatus.CANCELLED &&
                                    endReason ===
                                      SpecimenAssignmentEndReason.SPECIMEN_CANCELLED) ||
                                  (specimen.status ===
                                    SpecimenStatus.REJECTED &&
                                    endReason ===
                                      SpecimenAssignmentEndReason.SPECIMEN_REJECTED) ||
                                  !endedAt,
                              )
                              .map(
                                ({
                                  labOrderItem: {
                                    performable: { id, displayName },
                                  },
                                }) => (
                                  <Badge key={id} variant="secondary">
                                    {displayName}
                                  </Badge>
                                ),
                              )
                          : "—"}
                      </div>
                    }
                  />
                </div>
              </div>
              {specimen.note && (
                <Alert className="mt-3 px-2.5 pt-1.5 pb-2">
                  <AlertTitle className="text-muted-foreground">
                    Note :
                  </AlertTitle>
                  <AlertDescription>{specimen.note}</AlertDescription>
                </Alert>
              )}
              {specimen.cancellationReason && (
                <Alert className="mt-3 px-2.5 pt-1.5 pb-2 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                  <AlertTitle className="text-muted-foreground">
                    Cancellation Reason : {specimen.cancellationReason}
                  </AlertTitle>
                </Alert>
              )}
              {specimen.rejectionReason && (
                <Alert className="mt-3 px-2.5 pt-1.5 pb-2 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                  <AlertTitle className="text-muted-foreground">
                    Rejection Reason : {specimen.rejectionReason}
                  </AlertTitle>
                </Alert>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
