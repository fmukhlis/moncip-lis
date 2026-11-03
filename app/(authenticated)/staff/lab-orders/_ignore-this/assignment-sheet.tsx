"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import {
  PERFORMABLES,
  SPECIMEN_TYPES,
  buildBulkPlan,
  getAutoCheck,
  type AssignmentMethod,
  type AssignmentPlan,
  type LabOrderItem,
  type Specimen,
} from "./data";
import { PriorityBadge, formatDateTime } from "./shared";

/* ------------------------------------------------------------------ */
/* Single-item assignment sheet                                        */
/* ------------------------------------------------------------------ */

interface AssignmentSheetProps {
  item: LabOrderItem | null;
  allItems: LabOrderItem[];
  specimens: Specimen[];
  onClose: () => void;
  onConfirm: (plan: AssignmentPlan) => Promise<void>;
}

export function AssignmentSheet({
  item,
  allItems,
  specimens,
  onClose,
  onConfirm,
}: AssignmentSheetProps) {
  return (
    <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        {item && (
          <AssignmentForm
            key={item.id}
            item={item}
            allItems={allItems}
            specimens={specimens}
            onClose={onClose}
            onConfirm={onConfirm}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function AssignmentForm({
  item,
  allItems,
  specimens,
  onClose,
  onConfirm,
}: Omit<AssignmentSheetProps, "item"> & { item: LabOrderItem }) {
  const perf = PERFORMABLES[item.performableId];
  const auto = useMemo(() => getAutoCheck(item), [item]);

  const [method, setMethod] = useState<AssignmentMethod>("AUTOMATIC");
  const [manualTypeId, setManualTypeId] = useState<string>(() => {
    const d = perf.defaultSpecimenTypeId;
    return d && SPECIMEN_TYPES[d].available ? d : "";
  });
  const [choice, setChoice] = useState<string>("new"); // "new" | specimenId
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typeId =
    method === "AUTOMATIC"
      ? auto.ok
        ? auto.typeId
        : null
      : manualTypeId || null;
  const type = typeId ? SPECIMEN_TYPES[typeId] : null;

  const compatible = useMemo(
    () =>
      typeId
        ? specimens.filter(
            (s) => s.mrn === item.patient.mrn && s.typeId === typeId,
          )
        : [],
    [specimens, typeId, item.patient.mrn],
  );

  // Prefer reusing a compatible specimen whenever one exists.
  useEffect(() => {
    setChoice(compatible[0]?.id ?? "new");
  }, [typeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Other pending items in the same order that accept the selected type.
  const siblings = useMemo(
    () =>
      typeId
        ? allItems.filter(
            (i) =>
              i.orderNo === item.orderNo &&
              i.id !== item.id &&
              i.status === "UNASSIGNED" &&
              PERFORMABLES[i.performableId].supportedSpecimenTypeIds.includes(
                typeId,
              ),
          )
        : [],
    [allItems, item, typeId],
  );

  async function submit() {
    if (!typeId) return;
    setSaving(true);
    setError(null);
    try {
      await onConfirm({
        itemId: item.id,
        typeId,
        method,
        specimen:
          choice === "new" ? { kind: "new" } : { kind: "existing", id: choice },
      });
      onClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not save the assignment.",
      );
      setSaving(false);
    }
  }

  return (
    <>
      <SheetHeader className="space-y-1 px-6 pt-6 text-left">
        <SheetTitle>Assign specimen</SheetTitle>
        <SheetDescription>
          Choose the specimen type for this order item before it moves to
          collection.
        </SheetDescription>
      </SheetHeader>

      <div className="mx-6 mt-4 rounded-md border bg-muted/30 px-3 py-2.5 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">{perf.name}</span>
          <PriorityBadge priority={item.priority} />
        </div>
        <div className="mt-1 text-muted-foreground">
          {item.patient.name} · {item.patient.mrn}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {item.orderNo} · {perf.type === "PANEL" ? "Panel" : "Single test"} ·
          Ordered {formatDateTime(item.orderedAt)}
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {/* Method */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium">Assignment method</h3>
          <RadioGroup
            value={method}
            onValueChange={(v) => setMethod(v as AssignmentMethod)}
            className="gap-2"
          >
            <MethodOption
              value="AUTOMATIC"
              selected={method === "AUTOMATIC"}
              title="Automatic"
              description="Use the default specimen type configured for this test."
            />
            <MethodOption
              value="MANUAL"
              selected={method === "MANUAL"}
              title="Manual"
              description="Pick from the specimen types this test supports."
            />
          </RadioGroup>
        </section>

        {/* Method-specific content */}
        {method === "AUTOMATIC" ? (
          auto.ok ? (
            <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm dark:border-emerald-900 dark:bg-emerald-950/40">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <div>
                <div className="font-medium">
                  {SPECIMEN_TYPES[auto.typeId].name}
                </div>
                <div className="text-xs text-muted-foreground">
                  Default specimen type ·{" "}
                  {SPECIMEN_TYPES[auto.typeId].container} · supported and
                  available
                </div>
              </div>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>Automatic assignment is not possible</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{auto.reason}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setMethod("MANUAL")}
                >
                  Assign manually
                </Button>
              </AlertDescription>
            </Alert>
          )
        ) : (
          <section className="space-y-2">
            <h3 className="text-sm font-medium">Supported specimen types</h3>
            <RadioGroup
              value={manualTypeId}
              onValueChange={setManualTypeId}
              className="gap-2"
            >
              {perf.supportedSpecimenTypeIds.map((id) => {
                const t = SPECIMEN_TYPES[id];
                const isDefault = id === perf.defaultSpecimenTypeId;
                return (
                  <Label
                    key={id}
                    htmlFor={`type-${id}`}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 font-normal",
                      manualTypeId === id && "border-primary bg-primary/5",
                      !t.available && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <RadioGroupItem
                      id={`type-${id}`}
                      value={id}
                      disabled={!t.available}
                      className="mt-0.5"
                    />
                    <div className="flex-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t.name}</span>
                        {isDefault && (
                          <Badge
                            variant="secondary"
                            className="rounded-sm px-1.5 py-0 text-xs"
                          >
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.container}
                        {!t.available &&
                          ` · Unavailable: ${t.unavailableReason}`}
                      </div>
                    </div>
                  </Label>
                );
              })}
            </RadioGroup>
          </section>
        )}

        {/* Specimen reuse */}
        {type && (
          <>
            <Separator />
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Physical specimen</h3>
              <RadioGroup
                value={choice}
                onValueChange={setChoice}
                className="gap-2"
              >
                {compatible.map((s) => {
                  const shared = allItems.filter(
                    (i) => i.assignment?.specimenId === s.id,
                  ).length;
                  return (
                    <Label
                      key={s.id}
                      htmlFor={`spc-${s.id}`}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 font-normal",
                        choice === s.id && "border-primary bg-primary/5",
                      )}
                    >
                      <RadioGroupItem
                        id={`spc-${s.id}`}
                        value={s.id}
                        className="mt-0.5"
                      />
                      <div className="text-sm">
                        <div className="font-medium">Reuse {s.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {type.name} · from {s.orderNo} · shared by {shared}{" "}
                          item{shared === 1 ? "" : "s"}
                        </div>
                      </div>
                    </Label>
                  );
                })}
                <Label
                  htmlFor="spc-new"
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 font-normal",
                    choice === "new" && "border-primary bg-primary/5",
                  )}
                >
                  <RadioGroupItem id="spc-new" value="new" className="mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">Create new specimen</div>
                    <div className="text-xs text-muted-foreground">
                      {compatible.length === 0
                        ? `No compatible ${type.name} specimen exists for this patient.`
                        : "Use this if a separate draw is required."}
                    </div>
                  </div>
                </Label>
              </RadioGroup>
              {siblings.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {siblings.length} other pending item
                  {siblings.length === 1 ? "" : "s"} in this order accept{" "}
                  {type.name}:{" "}
                  {siblings
                    .map((s) => PERFORMABLES[s.performableId].name)
                    .join(", ")}
                  . Assign {siblings.length === 1 ? "it" : "them"} next to share
                  this specimen.
                </p>
              )}
            </section>
          </>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Assignment not saved</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <SheetFooter className="flex-row items-center justify-between gap-2 border-t px-6 py-4 sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Recorded as {method === "AUTOMATIC" ? "automatic" : "manual"}{" "}
          assignment.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!typeId || saving}>
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Confirm assignment
          </Button>
        </div>
      </SheetFooter>
    </>
  );
}

function MethodOption({
  value,
  selected,
  title,
  description,
}: {
  value: AssignmentMethod;
  selected: boolean;
  title: string;
  description: string;
}) {
  return (
    <Label
      htmlFor={`method-${value}`}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 font-normal",
        selected && "border-primary bg-primary/5",
      )}
    >
      <RadioGroupItem id={`method-${value}`} value={value} className="mt-0.5" />
      <div className="text-sm">
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </Label>
  );
}

/* ------------------------------------------------------------------ */
/* Bulk automatic assignment dialog                                    */
/* ------------------------------------------------------------------ */

interface BulkDialogProps {
  open: boolean;
  items: LabOrderItem[];
  specimens: Specimen[];
  onClose: () => void;
  onConfirm: (plans: AssignmentPlan[]) => Promise<void>;
}

export function BulkAutoAssignDialog({
  open,
  items,
  specimens,
  onClose,
  onConfirm,
}: BulkDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { rows, skipped, newGroups } = useMemo(
    () => buildBulkPlan(items, specimens),
    [items, specimens],
  );
  const reused = rows.filter((r) => r.reuseId).length;

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await onConfirm(rows.map((r) => r.plan));
      onClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not save the assignments.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Automatic assignment for {items.length} items
          </DialogTitle>
          <DialogDescription>
            Each item is validated against its configured default specimen type.
            Items that fail validation are skipped and stay unassigned.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] space-y-4 overflow-y-auto text-sm">
          {rows.length > 0 && (
            <section className="space-y-1.5">
              <h3 className="font-medium">
                Will be assigned ({rows.length}){" "}
                <span className="font-normal text-muted-foreground">
                  · {newGroups.size} new specimen
                  {newGroups.size === 1 ? "" : "s"}, {reused} reused
                </span>
              </h3>
              <ul className="divide-y rounded-md border">
                {rows.map(({ item, plan, reuseId }) => {
                  const groupSize =
                    plan.specimen.kind === "new" && plan.specimen.groupKey
                      ? newGroups.get(plan.specimen.groupKey)
                      : 0;
                  return (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {PERFORMABLES[item.performableId].name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {item.patient.name} · {item.orderNo}
                        </div>
                      </div>
                      <div className="shrink-0 text-right text-xs">
                        <div>{SPECIMEN_TYPES[plan.typeId].name}</div>
                        <div className="text-muted-foreground">
                          {reuseId
                            ? `Reuse ${reuseId}`
                            : groupSize && groupSize > 1
                              ? `New specimen (shared by ${groupSize})`
                              : "New specimen"}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {skipped.length > 0 && (
            <section className="space-y-1.5">
              <h3 className="font-medium text-amber-700 dark:text-amber-400">
                Skipped ({skipped.length})
              </h3>
              <ul className="divide-y rounded-md border border-amber-200 dark:border-amber-900">
                {skipped.map(({ item, reason }) => (
                  <li key={item.id} className="px-3 py-2">
                    <div className="font-medium">
                      {PERFORMABLES[item.performableId].name}{" "}
                      <span className="font-normal text-muted-foreground">
                        · {item.patient.name}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {reason}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>Assignments not saved</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={rows.length === 0 || saving}>
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Assign {rows.length} item{rows.length === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
