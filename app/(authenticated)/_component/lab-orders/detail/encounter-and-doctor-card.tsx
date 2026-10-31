"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { InfoRow, InfoRowSkeleton } from "./info-row";
import { useGetLabOrderActionQuery } from "@/features/lab-order/lab-order.api";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";

export default function EncounterAndDoctorCard({
  labOrderId,
}: {
  labOrderId: string;
}) {
  const { data, isFetching } = useGetLabOrderActionQuery({ id: labOrderId });

  const requestPayload = data?.data?.inboundEvents
    .filter(({ eventType }) => eventType === "CLINICAL_ORDER_CREATED")
    .at(0)?.requestPayload as unknown as
    | {
        encounter: {
          id: string;
          no: string;
          type: string;
          status: string;
        };
        orderingProvider: { id: string; name: string };
      }
    | undefined;

  return (
    <Card>
      {isFetching || !requestPayload ? (
        <>
          <CardHeader className="gap-0">
            <CardTitle className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Building2 className="size-4" />
              Encounter &amp; Doctor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRowSkeleton label="Encounter No." />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-x-3 gap-y-2">
              <InfoRowSkeleton label="Encounter Status" />
              <InfoRowSkeleton label="Encounter Type" />
            </div>
            <Separator />
            <div>
              <p className="mb-1.5 text-[11px] text-muted-foreground">
                Ordering Provider
              </p>
              <Skeleton className="w-28 h-[17px]" />
              <Skeleton className="w-16 h-4 mt-1" />
            </div>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className="gap-0">
            <CardTitle className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Building2 className="size-4" />
              Encounter &amp; Doctor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              label="Encounter No."
              value={requestPayload.encounter.no}
            />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-x-3 gap-y-2">
              <InfoRow
                label="Encounter Status"
                value={
                  <span className="font-semibold text-success">
                    {requestPayload.encounter.status}
                  </span>
                }
              />
              <InfoRow
                label="Encounter Type"
                value={requestPayload.encounter.type}
              />
            </div>
            <Separator />
            <div>
              <p className="mb-1 text-[11px] text-muted-foreground">
                Ordering Provider
              </p>
              <p className="text-sm font-semibold">
                {requestPayload.orderingProvider.name}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                ID: {requestPayload.orderingProvider.id}
              </p>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}
