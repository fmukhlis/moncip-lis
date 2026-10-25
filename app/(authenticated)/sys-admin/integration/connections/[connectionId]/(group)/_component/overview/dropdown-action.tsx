"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { CircleOff, CircleCheckBig, MoreHorizontal } from "lucide-react";
import { useUpdateIntegrationConnectionActionMutation } from "@/features/integration-connection/integration-connection.api";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export function DropdownAction({
  id,
  mode,
  name,
}: {
  id: string;
  mode: "Activate" | "Deactivate";
  name: string;
}) {
  // Server state
  const [updateIntegrationConnectionAction, { isLoading }] =
    useUpdateIntegrationConnectionActionMutation();

  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async () => {
    if (!id) return;

    try {
      const res = await updateIntegrationConnectionAction({
        id,
        isActive: mode === "Activate",
      }).unwrap();
      toast.success(`Connection "${res.data.name}" ${mode.toLowerCase()}d`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${mode.toLowerCase()} integration connection`,
      );
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant={mode === "Activate" ? "default" : "destructive"}
              asChild
            >
              <button
                onClick={() => {
                  setIsOpen(true);
                }}
                className={`${mode === "Activate" ? "text-chart-2 focus:**:!text-chart-2 focus:text-chart-2 focus:bg-chart-2/10" : ""} w-full gap-2`}
              >
                {mode === "Activate" ? (
                  <>
                    <CircleCheckBig />
                    {mode}
                  </>
                ) : (
                  <>
                    <CircleOff />
                    {mode}
                  </>
                )}
              </button>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia
              className={
                mode === "Activate"
                  ? "bg-green-500/10 text-green-500 dark:bg-green-500/20 dark:text-green-500"
                  : "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive"
              }
            >
              {mode === "Activate" ? <CircleCheckBig /> : <CircleOff />}
            </AlertDialogMedia>
            <AlertDialogTitle>
              {`${mode} connection "${name}"?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {mode === "Activate"
                ? "This integration connection will become active and able to send or receive requests again."
                : "This integration connection will be disabled and will no longer process incoming or outgoing requests."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <Button disabled={isLoading} onClick={handleSubmit}>
              {isLoading ? (
                <div className="flex gap-1 items-center">
                  <Spinner />
                  {mode === "Activate" ? "Activating..." : "Deactivating..."}
                </div>
              ) : (
                <div>{mode}</div>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
