"use client";

import SyncLabOrderablesDialog from "./sync-lab-orderables-dialog";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useFakeProgress } from "../_hook/use-fake-progress";
import { Field, FieldLabel } from "@/components/ui/field";
import { CardFooter, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Clock, Database, RefreshCcw } from "lucide-react";
import { useSyncExternalLabOrderablesActionMutation } from "@/features/external-lab-orderable/external-lab-orderable.api";
import { useGetOutboundIntegrationEventsActionQuery } from "@/features/outbound-integration-event/outbound-integration-event.api";

export default function SyncLabOrderablesCardAction() {
  const { complete, isRunning, progress, reset, start } = useFakeProgress({
    tickMs: 500,
    tickStep: 5,
  });

  const [syncExternalLabOrderablesAction] =
    useSyncExternalLabOrderablesActionMutation();

  const { data, isFetching } = useGetOutboundIntegrationEventsActionQuery({
    eventType: ["CATALOG_SYNC"],
  });

  const lastAcknowledgedEventResultSummary = data?.data.find(
    (e) => e.status === "ACKNOWLEDGED",
  )?.resultSummary as
    | { data: { created: number; updated: number } }
    | undefined;

  const lastEvent = data?.data.at(0);

  async function handleSync(credentialId: string) {
    start();
    try {
      const result = await syncExternalLabOrderablesAction({
        credentialId,
      }).unwrap();
      toast.success(
        `Synchronization completed. ${result?.data.created} new orderables added, ${result?.data.updated} updated.`,
      );
      complete();
    } catch (error) {
      reset();
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to synchronize lab orderables`,
      );
    }
  }

  return (
    <>
      <CardContent className="min-h-[30px] flex flex-col">
        {isRunning ? (
          <Field className="w-full gap-1.5">
            <FieldLabel
              htmlFor="progress-upload"
              className="text-muted-foreground text-xs"
            >
              <RefreshCcw className="size-3" />
              <span>Synchronizing...</span>
              <span className="ml-auto">{progress.toFixed(1)}%</span>
            </FieldLabel>
            <Progress value={progress} id="progress-upload" />
          </Field>
        ) : (
          <div className="flex items-center my-auto text-muted-foreground gap-1">
            <Database className="size-3.5" />
            {isFetching ? (
              <Skeleton className="h-3.5 w-14 mr-auto" />
            ) : (
              <span className="text-xs mr-auto">
                {(lastAcknowledgedEventResultSummary?.data.created ?? 0) +
                  (lastAcknowledgedEventResultSummary?.data.updated ?? 0)}{" "}
                items
              </span>
            )}
            <Clock className="size-3" />
            {isFetching ? (
              <Skeleton className="h-3.5 w-32" />
            ) : (
              <span className="text-xs">
                {lastEvent?.lastAttemptAt
                  ? "Last attempt " +
                    formatDistanceToNow(lastEvent.lastAttemptAt, {
                      addSuffix: true,
                    })
                  : "No attempts yet"}
              </span>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <SyncLabOrderablesDialog onConfirm={handleSync} />
      </CardFooter>
    </>
  );
}
