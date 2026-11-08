"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { InfoRow } from "@/app/(authenticated)/_component/lab-orders/detail/info-row";
import {
  ChevronDown,
  ClipboardList,
  CircleDashed,
  Recycle,
  TestTube,
  TestTubes,
  User,
} from "lucide-react";
import ClientDateTimeText from "@/components/ui/client-date-time-text";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import LabOrderPriorityBadge from "@/app/(authenticated)/_component/lab-orders/lab-order-priority-badge";
import LabOrderItemStatusBadge from "@/app/(authenticated)/_component/lab-orders/detail/lab-order-item-status-badge";
import { LabOrderItemStatus } from "@/generated/prisma";
import {
  getOrderProgress,
  PATIENT_SEX_LABEL,
  getEligibleItems,
  getActiveSpecimenAssignment,
  type SpecimenAssignmentOrder,
} from "./helpers";

export function PatientCollapsible({
  order,
}: {
  order: SpecimenAssignmentOrder;
}) {
  const { patient } = order;

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="group -ml-2 h-8 max-w-full justify-start gap-1.5 px-2 font-normal"
        >
          <User className="text-muted-foreground size-3.5" />
          <span className="truncate text-sm font-medium">{patient.name}</span>
          <span className="text-muted-foreground truncate text-xs">
            MRN: {patient.mrn ?? "—"}
          </span>
          <ChevronDown className="text-muted-foreground size-3.5 transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="bg-muted/30 mt-2 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-x-3 gap-y-2 rounded-lg border p-3">
          <InfoRow label="Name" value={patient.name} />
          <InfoRow label="MRN" value={patient.mrn ?? "—"} />
          <InfoRow
            label="Date of Birth"
            value={
              <ClientDateTimeText
                formatStr="dd MMM yyyy"
                dateTime={patient.dateOfBirth}
              />
            }
          />
          <InfoRow
            label="Sex"
            value={patient.sex ? PATIENT_SEX_LABEL[patient.sex] : "—"}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function OrderItemsCollapsible({
  order,
}: {
  order: SpecimenAssignmentOrder;
}) {
  const cancelledCount = order.items.length - getEligibleItems(order).length;

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="group -ml-2 h-8 justify-start gap-1.5 px-2 font-normal"
        >
          <ClipboardList className="text-muted-foreground size-3.5" />
          <span className="text-sm font-medium">
            {order.items.length} order{" "}
            {order.items.length === 1 ? "item" : "items"}
          </span>
          {cancelledCount ? (
            <span className="text-muted-foreground text-xs">
              {cancelledCount} cancelled
            </span>
          ) : null}
          <ChevronDown className="text-muted-foreground size-3.5 transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="mt-2 divide-y rounded-lg border">
          {order.items.map((item) => {
            const isCancelled = item.status === LabOrderItemStatus.CANCELLED;
            const activeAssignment = getActiveSpecimenAssignment(item);

            return (
              <li
                key={item.id}
                className={cn(
                  "flex flex-col gap-1.5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between",
                  isCancelled && "opacity-60",
                )}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCancelled && "line-through",
                    )}
                  >
                    {item.performable.displayName}
                  </span>
                  {item.priority ? (
                    <LabOrderPriorityBadge priority={item.priority} />
                  ) : (
                    "—"
                  )}
                  {isCancelled ? (
                    <LabOrderItemStatusBadge status={item.status} />
                  ) : null}
                </div>
                {isCancelled ? null : activeAssignment ? (
                  <Badge variant="secondary">
                    <TestTubes />
                    {activeAssignment.specimen.specimenType.displayName}
                    <span className="text-muted-foreground">
                      · {activeAssignment.specimen.no}
                    </span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    <CircleDashed />
                    Not assigned
                  </Badge>
                )}
              </li>
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AssignmentProgress({
  order,
}: {
  order: SpecimenAssignmentOrder;
}) {
  const { assigned, total, percentage } = getOrderProgress(order);

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
        <span className="text-muted-foreground font-medium">
          Assignment progress
        </span>
        <span className="font-medium">
          {assigned} of {total} items assigned
        </span>
      </div>
      <Progress
        value={percentage}
        className="h-1.5"
        aria-label={`${assigned} of ${total} order items assigned`}
      />
    </div>
  );
}

export function AssignSpecimenButton({
  order,
  onAssignSpecimen,
}: {
  order: SpecimenAssignmentOrder;
  onAssignSpecimen: (
    order: SpecimenAssignmentOrder,
    trigger: HTMLButtonElement,
  ) => void;
}) {
  return (
    <Button
      size="sm"
      className="w-full sm:w-auto"
      onClick={(e) => onAssignSpecimen(order, e.currentTarget)}
    >
      <TestTube />
      Create Specimen
    </Button>
  );
}

/**
 * Opens the assign-existing-specimen dialog for an order.
 *
 * The dialog points a specimen that already exists at tests of this order: the
 * specimen is picked inside the dialog and usually comes from another order of
 * the same patient. That is why the button sits next to creating a specimen
 * instead of on a specimen, and why it follows the same rule as creating one:
 * an order whose items all have a specimen has nothing left to assign.
 */
export function AssignExistingSpecimenButton({
  order,
  onAssignExistingSpecimen,
}: {
  order: SpecimenAssignmentOrder;
  onAssignExistingSpecimen: (
    order: SpecimenAssignmentOrder,
    trigger: HTMLButtonElement,
  ) => void;
}) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="w-full sm:w-auto"
      onClick={(e) => onAssignExistingSpecimen(order, e.currentTarget)}
    >
      <Recycle />
      Assign Existing Specimen
    </Button>
  );
}
