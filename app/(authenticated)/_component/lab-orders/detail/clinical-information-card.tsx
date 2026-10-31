"use client";

import { FileText } from "lucide-react";
import { InfoRow, InfoRowSkeleton } from "./info-row";
import { useGetLabOrderActionQuery } from "@/features/lab-order/lab-order.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClinicalInformationCard({
  labOrderId,
}: {
  labOrderId: string;
}) {
  const { data, isFetching } = useGetLabOrderActionQuery({ id: labOrderId });

  const requestPayload = data?.data?.inboundEvents
    .filter(({ eventType }) => eventType === "CLINICAL_ORDER_CREATED")
    .at(0)?.requestPayload as unknown as
    | {
        clinicalContext?:
          | {
              clinicalNote?: string | undefined;
              clinicalIndication?: string | undefined;
            }
          | undefined;
      }
    | undefined;

  console.log("requestPayload: ", typeof requestPayload?.clinicalContext);

  return (
    <Card>
      {isFetching || !requestPayload ? (
        <>
          <CardHeader className="gap-0">
            <CardTitle className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <FileText className="size-4" />
              Clinical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <InfoRowSkeleton label="Indication" />
            <InfoRowSkeleton label="Note" />
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className="gap-0">
            <CardTitle className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <FileText className="size-4" />
              Clinical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <InfoRow
              label="Indication"
              value={
                requestPayload.clinicalContext?.clinicalIndication ?? (
                  <span className="text-muted-foreground">—</span>
                )
              }
            />
            <InfoRow
              label="Note"
              value={
                requestPayload.clinicalContext?.clinicalNote ?? (
                  <span className="text-muted-foreground">—</span>
                )
              }
            />
          </CardContent>
        </>
      )}
    </Card>
  );
}
