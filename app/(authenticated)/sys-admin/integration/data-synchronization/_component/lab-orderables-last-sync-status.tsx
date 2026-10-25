"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetOutboundIntegrationEventsActionQuery } from "@/features/outbound-integration-event/outbound-integration-event.api";

export default function LabOrderablesLastSyncStatus() {
  const { data, isFetching } = useGetOutboundIntegrationEventsActionQuery({
    eventType: ["CATALOG_SYNC"],
  });

  const lastEvent = data?.data.at(0);

  let className = "";
  let badgeText = "";

  switch (lastEvent?.status) {
    case "QUEUED":
      badgeText = "Queued";
      className = "bg-secondary/10 text-secondary border-secondary/30";
      break;
    case "SENDING":
      badgeText = "Sending";
      className = "bg-info/10 text-info border-info/30";
      break;
    case "SENT":
      badgeText = "Sent";
      className = "bg-info/10 text-info border-info/30";
      break;
    case "ACKNOWLEDGED":
      badgeText = "Acknowledged";
      className = "bg-success/10 text-success border-success/30";
      break;
    case "FAILED":
      badgeText = "Failed";
      className = "bg-destructive/10 text-destructive border-destructive/30";
      break;
    case "CANCELLED":
      badgeText = "Cancelled";
      className = "bg-warning/10 text-warning border-warning/30";
      break;
  }

  return isFetching ? (
    <Skeleton className="w-20 h-5" />
  ) : (
    badgeText && (
      <Badge variant={"outline"} className={className}>
        {badgeText}
      </Badge>
    )
  );
}
