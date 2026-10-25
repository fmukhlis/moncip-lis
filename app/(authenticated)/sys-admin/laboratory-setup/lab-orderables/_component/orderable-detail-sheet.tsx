"use client";

import JsonViewer from "./json-viewer";
import DepartmentChip from "./department-chip";
import ClientDateTimeText from "@/components/ui/client-date-time-text";
import ResultComponentsTable from "./result-components-table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUpdateLisPerformableActionMutation } from "@/features/lis-performable/lis-performable.api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetStoredExternalLabOrderableActionQuery } from "@/features/external-lab-orderable/external-lab-orderable.api";
import {
  setIsOrderableDetailSheetOpen,
  setIsEditPerformableDialogOpen,
  setIsCreatePerformableDialogOpen,
} from "../slice";
import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetContent,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Plus,
  Link2,
  Layers,
  Pencil,
  TestTube,
  AlertTriangle,
  TestTubeDiagonal,
} from "lucide-react";

export default function OrderableDetailSheet({
  orderableId,
}: {
  orderableId: string | null;
}) {
  // Global state
  const isOpen = useAppSelector(
    (state) => state.labOrderables.isOrderableDetailSheetOpen,
  );
  const dispatch = useAppDispatch();

  // Server state
  const { data, isFetching } = useGetStoredExternalLabOrderableActionQuery(
    orderableId ? { id: orderableId } : skipToken,
  );
  const [updateLisPerformableAction, { isLoading }] =
    useUpdateLisPerformableActionMutation();

  const performable = data?.data?.performables.at(0);
  const defaultSpecimen = performable?.specimenTypes.find((s) => s.isDefault);
  const isFlaggedInactive = !data?.data?.isActive && performable?.isActive;
  const otherSupportedSpecimensCount = performable
    ? performable.specimenTypes.length - 1
    : 0;

  async function handleTogglePerformableStatus() {
    if (!performable) return;

    try {
      await updateLisPerformableAction({
        id: performable.id,
        isActive: !performable.isActive,
      }).unwrap();
      toast.success(`Performable "${performable.displayName}" updated`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to update performable`,
      );
    }
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        dispatch(setIsOrderableDetailSheetOpen(open));
      }}
    >
      <SheetContent className="w-full sm:max-w-3xl gap-0">
        {isFetching || !data?.data ? (
          <>
            <SheetHeader>
              <div className="flex gap-1 items-center">
                <Skeleton className="h-[18px] w-1/4" />
                <Skeleton className="h-[18px] w-1/5" />
              </div>
              <SheetTitle>
                <Skeleton className="h-6 w-2/3" />
              </SheetTitle>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Skeleton className="h-5 w-13" />
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-5"
                />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-11" />
                <Skeleton className="h-5 w-15" />
              </div>
            </SheetHeader>
            <div className="grid flex-1 auto-rows-min px-4 pb-4 gap-4 overflow-y-auto">
              <Tabs defaultValue="mapping" className="min-w-0">
                <TabsList>
                  <TabsTrigger value="mapping" disabled>
                    LIS Mapping
                  </TabsTrigger>
                  <TabsTrigger value="external" disabled>
                    External Data
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="mapping">
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex flex-col gap-2">
                      <div className="rounded-lg border border-dashed border-muted-foreground/50 bg-card px-6 py-5 text-center">
                        <Link2 className="mx-auto size-8 text-muted-foreground/50" />
                        <Skeleton className="mt-2 h-4 w-40 mx-auto" />
                        <Skeleton className="mt-4 h-4 w-1/2 mx-auto" />
                        <Skeleton className="mt-1 h-4 w-1/3 mx-auto" />
                        <Skeleton className="h-8 mt-4 w-28 mx-auto" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <>
            <SheetHeader>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {data.data.sourceSystem} · {data.data.connection.name}
              </div>
              <SheetTitle className="text-lg leading-snug">
                {data.data.externalDisplay}
              </SheetTitle>
              <SheetDescription className="sr-only">
                Catalog details and LIS mapping for {data.data.externalDisplay}
              </SheetDescription>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <div className="font-mono text-xs">
                  {data.data.externalCode}
                </div>
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-5"
                />
                <Badge variant="secondary" className="font-mono">
                  {data.data.externalCodeSystem}
                </Badge>
                <Badge variant="outline">
                  {data.data.type === "PANEL" ? (
                    <Layers className="h-3 w-3" />
                  ) : (
                    <TestTubeDiagonal className="h-3 w-3" />
                  )}
                  {data.data.type === "PANEL" ? "Panel" : "Test"}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    data.data.isActive
                      ? "border-success/30 bg-success/15 text-success"
                      : "border-warning/30 bg-warning/15 text-warning"
                  }
                >
                  {data.data.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </SheetHeader>
            <div className="grid flex-1 auto-rows-min px-4 pb-4 gap-4 overflow-y-auto">
              {isFlaggedInactive && (
                <Alert className="border-warning/30 bg-warning/15 text-warning">
                  <AlertTriangle />
                  <AlertTitle>Deactivated in source system</AlertTitle>
                  <AlertDescription className="text-warning/70">
                    The HIS marked this orderable inactive, but its LIS mapping
                    is still active. Consider reviewing whether this test should
                    still be available for ordering.
                  </AlertDescription>
                </Alert>
              )}
              <Tabs defaultValue="mapping" className="min-w-0">
                <TabsList>
                  <TabsTrigger value="mapping">LIS Mapping</TabsTrigger>
                  <TabsTrigger value="external">External Data</TabsTrigger>
                </TabsList>
                <TabsContent value="mapping">
                  <div className="flex flex-col gap-2 pt-2">
                    {performable ? (
                      <>
                        <div className="rounded-lg border border-border bg-card shadow-sm px-3 py-2.5">
                          <div className="flex items-start justify-between gap-2.5">
                            <div>
                              <p className="text-sm font-semibold">
                                {performable.displayName}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline">
                                  {data.data.type === "PANEL" ? (
                                    <Layers />
                                  ) : (
                                    <TestTubeDiagonal />
                                  )}
                                  {data.data.type === "PANEL"
                                    ? "Panel"
                                    : "Test"}
                                </Badge>
                                <DepartmentChip
                                  id={performable.department?.id}
                                />
                                {defaultSpecimen ? (
                                  <>
                                    <Badge variant="outline">
                                      <TestTube />
                                      {defaultSpecimen.specimenType.displayName}
                                    </Badge>
                                    {otherSupportedSpecimensCount > 0 && (
                                      <Badge variant="secondary">
                                        +{otherSupportedSpecimensCount} other
                                        specimens
                                      </Badge>
                                    )}
                                  </>
                                ) : (
                                  <Badge variant="outline">No specimen</Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                dispatch(setIsEditPerformableDialogOpen(true));
                              }}
                            >
                              <Pencil /> Edit
                            </Button>
                          </div>
                          <Separator className="mt-2 mb-1.5" />
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor={`perf-active-${performable.id}`}
                              className="text-sm"
                            >
                              Active in LIS
                            </Label>
                            <div className="flex items-center gap-2">
                              {isLoading && (
                                <Spinner className="text-muted-foreground" />
                              )}
                              <Switch
                                size="default"
                                id={`perf-active-${performable.id}`}
                                checked={performable.isActive}
                                disabled={isLoading}
                                onCheckedChange={handleTogglePerformableStatus}
                              />
                            </div>
                          </div>
                        </div>
                        <ResultComponentsTable performableId={performable.id} />
                      </>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="rounded-lg border border-dashed border-muted-foreground bg-card shadow-sm px-6 py-5 text-center">
                          <Link2 className="mx-auto size-8 text-muted-foreground" />
                          <p className="mt-2 text-sm font-medium">
                            Not mapped to a LIS test definition
                          </p>
                          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                            {`Results can't be recorded for this orderable until
                            it's mapped to a LIS performable and its result
                            components are defined.`}
                          </p>
                          <Button
                            size="sm"
                            variant="default"
                            className="mt-4"
                            onClick={() =>
                              dispatch(setIsCreatePerformableDialogOpen(true))
                            }
                          >
                            <Plus className="mr-1.5" />
                            Create LIS Mapping
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="external">
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="rounded-lg border shadow-sm px-3 py-2.5">
                      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            External Orderable ID
                          </dt>
                          <dd className={cn("mt-1.5 font-mono text-sm")}>
                            {data.data.externalOrderableId}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            External Code
                          </dt>
                          <dd className={cn("mt-1.5 font-mono text-sm")}>
                            {`${data.data.externalCode} (${data.data.externalCodeSystem})`}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Category
                          </dt>
                          <dd className={cn("mt-1.5 font-mono text-sm")}>
                            {data.data.categoryDisplay || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Source System
                          </dt>
                          <dd className={cn("mt-1.5 font-mono text-sm")}>
                            {data.data.sourceSystem}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Connection
                          </dt>
                          <dd className={cn("mt-1.5 font-mono text-sm")}>
                            {data.data.connection.name}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Last Synced
                          </dt>
                          <dd className={cn("mt-1.5 font-mono text-sm")}>
                            <ClientDateTimeText
                              formatStr="dd MMM yyyy, HH:mm"
                              dateTime={data.data.lastSyncedAt}
                            />
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div className="space-y-2">
                      <h4 className="h-8 flex items-center text-sm font-semibold">
                        Raw Catalog Snapshot
                      </h4>
                      <JsonViewer data={data.data.rawCatalogSnapshot} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
