"use client";

import SyncPatientsDialog from "./sync-patients-dialog";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useFakeProgress } from "../_hook/use-fake-progress";
import { Field, FieldLabel } from "@/components/ui/field";
import { CardFooter, CardContent } from "@/components/ui/card";
import { Clock, Database, RefreshCcw } from "lucide-react";

export default function SyncPatientsCardAction() {
  const { complete, isRunning, progress, reset, start } = useFakeProgress({
    tickMs: 500,
    tickStep: 5,
  });

  async function handleSync() {
    start();
    try {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      if (false) {
        reset();
      }
      toast.success(`Patients synchronized.`);
      complete();
    } catch (error) {
      reset();
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to synchronize patients`,
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
            <span className="text-xs mr-auto">0 items</span>
            <Clock className="size-3" />
            <span className="text-xs">No attempts yet</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <SyncPatientsDialog onConfirm={handleSync} />
      </CardFooter>
    </>
  );
}
