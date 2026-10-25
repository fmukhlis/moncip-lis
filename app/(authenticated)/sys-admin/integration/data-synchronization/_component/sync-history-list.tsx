"use client";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Squircle } from "lucide-react";
import { formatDate } from "date-fns";
import { useGetOutboundIntegrationEventsActionQuery } from "@/features/outbound-integration-event/outbound-integration-event.api";

export default function SyncHistoryList() {
  const { data, isFetching } = useGetOutboundIntegrationEventsActionQuery({
    page: 1,
    eventType: ["CATALOG_SYNC", "PATIENT_SYNC"],
  });

  return (
    <>
      {isFetching ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          Loading...
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <ul>
          {data?.data.map(
            ({
              id,
              sentAt,
              status,
              queuedAt,
              lastAttemptAt,
              resultSummary,
              acknowledgedAt,
            }) => {
              let time = "";
              let badgeText = "";
              let badgeClassName = "";
              let bulletClassName = "";

              switch (status) {
                case "QUEUED":
                  time = queuedAt;
                  badgeText = "Queued";
                  badgeClassName =
                    "bg-secondary/15 text-secondary border-secondary/30";
                  bulletClassName = "!text-secondary fill-secondary/60";
                  break;
                case "SENDING":
                  time = lastAttemptAt ?? "";
                  badgeText = "Sending";
                  badgeClassName = "bg-info/15 text-info border-info/30";
                  bulletClassName = "!text-info fill-info/60";
                  break;
                case "SENT":
                  badgeText = "Sent";
                  time = sentAt ?? "";
                  badgeClassName = "bg-info/15 text-info border-info/30";
                  bulletClassName = "!text-info fill-info/60";
                  break;
                case "ACKNOWLEDGED":
                  const summary = resultSummary as {
                    data: { created: number; updated: number } | undefined;
                  };
                  if (summary?.data) {
                    badgeText = `${summary.data.created ? "+" + summary.data.created + " new items" : summary.data.updated + " items updated"} `;
                  }
                  time = acknowledgedAt ?? "";
                  badgeClassName =
                    "bg-success/15 text-success border-success/30";
                  bulletClassName = "!text-success fill-success/60";
                  break;
                case "FAILED":
                  time = lastAttemptAt ?? "";
                  badgeText = "Failed";
                  badgeClassName =
                    "bg-destructive/15 text-destructive border-destructive/30";
                  bulletClassName = "!text-destructive fill-destructive/60";
                  break;
                case "CANCELLED":
                  time = lastAttemptAt ?? "";
                  badgeText = "Cancelled";
                  badgeClassName =
                    "bg-warning/15 text-warning border-warning/30";
                  bulletClassName = "!text-warning fill-warning/60";
                  break;
              }

              return (
                <li
                  key={id}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center justify-between border-t text-sm py-2 px-1"
                >
                  <div className="flex items-center gap-2">
                    <Squircle
                      strokeWidth={3}
                      className={`shrink-0 size-2.5 ${bulletClassName}`}
                    />
                    <div className="truncate">Lab Orderables</div>
                  </div>
                  <div className="truncate text-right">
                    Moncip HIS Simulator
                  </div>
                  <Badge
                    className={`sm:ml-auto ${badgeClassName}`}
                    variant={"outline"}
                  >
                    {badgeText}
                  </Badge>
                  <div className="text-muted-foreground text-right">
                    {formatDate(time, "dd MMM yyyy, HH.mm")}
                  </div>
                </li>
              );
            },
          )}
        </ul>
      ) : (
        <div className="text-sm text-muted-foreground">
          No sync attempts yet.
        </div>
      )}
    </>
  );
}
