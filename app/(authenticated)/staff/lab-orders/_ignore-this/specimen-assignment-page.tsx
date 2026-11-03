"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ClipboardCheck,
  RefreshCw,
  Search,
  SearchX,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { AssignmentSheet, BulkAutoAssignDialog } from "./assignment-sheet";
import {
  PERFORMABLES,
  PRIORITY_RANK,
  SEED_ITEMS,
  SEED_SPECIMENS,
  SPECIMEN_TYPES,
  TODAY,
  getAutoCheck,
  type AssignmentPlan,
  type LabOrderItem,
  type Priority,
  type Specimen,
} from "./data";
import { PriorityBadge, formatDateTime } from "./shared";

type LoadState = "loading" | "ready" | "error";
type StatusFilter = "UNASSIGNED" | "ASSIGNED" | "ALL";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nowStamp = () => {
  const d = new Date();
  return `${TODAY}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:00`;
};

export function SpecimenAssignmentPage({
  simulate,
}: {
  simulate?: "error" | "empty";
}) {
  const [forced, setForced] = useState(simulate);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [items, setItems] = useState<LabOrderItem[]>([]);
  const [specimens, setSpecimens] = useState<Specimen[]>([]);

  // filters
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");
  const [status, setStatus] = useState<StatusFilter>("UNASSIGNED");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: "priority", desc: false },
    { id: "orderedAt", desc: false },
  ]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // dialogs
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const specimenSeq = useRef(10);
  const failedOnce = useRef(new Set<string>());

  /* ----- simulated load ----- */
  useEffect(() => {
    if (loadState !== "loading") return;
    const t = setTimeout(() => {
      if (forced === "error") return setLoadState("error");
      setItems(
        forced === "empty"
          ? SEED_ITEMS.filter((i) => i.status === "ASSIGNED")
          : SEED_ITEMS,
      );
      setSpecimens(SEED_SPECIMENS);
      setLoadState("ready");
    }, 900);
    return () => clearTimeout(t);
  }, [loadState, forced]);

  function retry() {
    setForced(undefined);
    setLoadState("loading");
  }

  /* ----- derived data ----- */
  const metrics = useMemo(() => {
    const pending = items.filter((i) => i.status === "UNASSIGNED");
    return {
      pending: pending.length,
      stat: pending.filter((i) => i.priority === "STAT").length,
      urgent: pending.filter((i) => i.priority === "URGENT").length,
      issues: pending.filter((i) => !getAutoCheck(i).ok).length,
      assignedToday: items.filter((i) =>
        i.assignment?.assignedAt.startsWith(TODAY),
      ).length,
    };
  }, [items]);

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        if (status !== "ALL" && i.status !== status) return false;
        if (priority !== "ALL" && i.priority !== priority) return false;
        const d = i.orderedAt.slice(0, 10);
        if (dateFrom && d < dateFrom) return false;
        if (dateTo && d > dateTo) return false;
        return true;
      }),
    [items, status, priority, dateFrom, dateTo],
  );

  const filtersActive = !!(
    search ||
    priority !== "ALL" ||
    status !== "UNASSIGNED" ||
    dateFrom ||
    dateTo
  );
  function clearFilters() {
    setSearch("");
    setPriority("ALL");
    setStatus("UNASSIGNED");
    setDateFrom("");
    setDateTo("");
  }

  /* ----- simulated assignment (local state only) ----- */
  function applyAssignments(plans: AssignmentPlan[]) {
    const stamp = nowStamp();
    const groupIds = new Map<string, string>();
    const created: Specimen[] = [];
    const resolved = plans.map((p) => {
      const item = items.find((i) => i.id === p.itemId)!;
      if (p.specimen.kind === "existing")
        return { plan: p, specimenId: p.specimen.id };
      const key = p.specimen.groupKey ?? p.itemId;
      let id = groupIds.get(key);
      if (!id) {
        id = `SPC-261103-${String(++specimenSeq.current).padStart(3, "0")}`;
        groupIds.set(key, id);
        created.push({
          id,
          typeId: p.typeId,
          mrn: item.patient.mrn,
          orderNo: item.orderNo,
          createdAt: stamp,
        });
      }
      return { plan: p, specimenId: id };
    });

    setSpecimens((prev) => [...prev, ...created]);
    setItems((prev) =>
      prev.map((i) => {
        const r = resolved.find((x) => x.plan.itemId === i.id);
        if (!r) return i;
        return {
          ...i,
          status: "ASSIGNED",
          assignment: {
            specimenTypeId: r.plan.typeId,
            specimenId: r.specimenId,
            method: r.plan.method,
            assignedAt: stamp,
          },
        };
      }),
    );
    setRowSelection({});
    return resolved;
  }

  async function confirmSingle(plan: AssignmentPlan) {
    await sleep(700);
    const item = items.find((i) => i.id === plan.itemId)!;
    if (item.flakyOnce && !failedOnce.current.has(item.id)) {
      failedOnce.current.add(item.id);
      throw new Error(
        "The server did not respond. Nothing was changed. Try again.",
      );
    }
    const [r] = applyAssignments([plan]);
    toast.success(`${PERFORMABLES[item.performableId].name} assigned`, {
      description: `${SPECIMEN_TYPES[plan.typeId].name} · ${r.specimenId} · ${plan.method === "AUTOMATIC" ? "Automatic" : "Manual"}`,
    });
  }

  async function confirmBulk(plans: AssignmentPlan[]) {
    await sleep(900);
    applyAssignments(plans);
    toast.success(`${plans.length} items assigned automatically`);
  }

  /* ----- columns ----- */
  const columns = useMemo<ColumnDef<LabOrderItem>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            aria-label="Select all assignable rows on this page"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={`Select ${row.original.orderNo}`}
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
          />
        ),
      },
      {
        id: "orderNo",
        accessorKey: "orderNo",
        header: "Order No.",
        cell: ({ row }) => (
          // Adjust to your real Lab Order Detail route.
          <Link
            href={`/lab-orders/${row.original.orderNo}`}
            className="font-mono text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            {row.original.orderNo}
          </Link>
        ),
      },
      {
        id: "patient",
        accessorFn: (r) => `${r.patient.name} ${r.patient.mrn}`,
        header: "Patient",
        cell: ({ row }) => (
          <div className="leading-tight">
            <div className="font-medium">{row.original.patient.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.patient.mrn}
            </div>
          </div>
        ),
      },
      {
        id: "test",
        accessorFn: (r) => PERFORMABLES[r.performableId].name,
        header: "Test / Panel",
        cell: ({ row }) => {
          const p = PERFORMABLES[row.original.performableId];
          return (
            <div className="leading-tight">
              <div>{p.name}</div>
              <div className="text-xs text-muted-foreground">
                {p.type === "PANEL" ? "Panel" : "Single test"}
              </div>
            </div>
          );
        },
      },
      {
        id: "specimenType",
        enableSorting: false,
        header: "Specimen Type",
        cell: ({ row }) => {
          const item = row.original;
          if (item.assignment) {
            return (
              <div className="leading-tight">
                <div>{SPECIMEN_TYPES[item.assignment.specimenTypeId].name}</div>
                <div className="text-xs text-muted-foreground">
                  {item.assignment.specimenId}
                </div>
              </div>
            );
          }
          const check = getAutoCheck(item);
          if (check.ok) {
            return (
              <div className="leading-tight">
                <div>{SPECIMEN_TYPES[check.typeId].name}</div>
                <div className="text-xs text-muted-foreground">Default</div>
              </div>
            );
          }
          return (
            <div
              className="flex items-start gap-1.5 text-amber-700 dark:text-amber-400"
              title={check.reason}
            >
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <div className="leading-tight">
                <div className="font-medium">Selection required</div>
                <div className="text-xs">No valid default</div>
              </div>
            </div>
          );
        },
      },
      {
        id: "priority",
        accessorFn: (r) => PRIORITY_RANK[r.priority],
        header: ({ column }) => (
          <SortHeader column={column}>Priority</SortHeader>
        ),
        cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
      },
      {
        id: "orderedAt",
        accessorKey: "orderedAt",
        header: ({ column }) => (
          <SortHeader column={column}>Ordered At</SortHeader>
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground tabular-nums">
            {formatDateTime(row.original.orderedAt)}
          </span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) =>
          row.original.status === "UNASSIGNED" ? (
            <Button size="sm" onClick={() => setActiveItemId(row.original.id)}>
              <ClipboardCheck className="mr-1.5 size-3.5" />
              Assign
            </Button>
          ) : (
            <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              {row.original.assignment?.method === "AUTOMATIC"
                ? "Automatic"
                : "Manual"}
            </span>
          ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter: search, rowSelection },
    initialState: { pagination: { pageSize: 15 } },
    getRowId: (r) => r.id,
    enableRowSelection: (row) => row.original.status === "UNASSIGNED",
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: (row, _id, value: string) => {
      const q = value.trim().toLowerCase();
      if (!q) return true;
      const i = row.original;
      return [
        i.orderNo,
        i.patient.name,
        i.patient.mrn,
        PERFORMABLES[i.performableId].name,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedItems = table.getSelectedRowModel().rows.map((r) => r.original);
  const activeItem = items.find((i) => i.id === activeItemId) ?? null;
  const rows = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Specimen Assignment
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Review lab order items and assign the specimen each one will use.
            Assigned items move on to specimen collection.
          </p>
        </div>
        <dl className="flex divide-x rounded-md border text-sm">
          <Metric
            label="Unassigned items"
            value={metrics.pending}
            hint={
              metrics.pending
                ? `${metrics.stat} STAT · ${metrics.urgent} Urgent`
                : undefined
            }
            loading={loadState !== "ready"}
          />
          <Metric
            label="Assignment issues"
            value={metrics.issues}
            hint="Need manual selection"
            tone={metrics.issues ? "warn" : undefined}
            loading={loadState !== "ready"}
          />
          <Metric
            label="Assigned today"
            value={metrics.assignedToday}
            loading={loadState !== "ready"}
          />
        </dl>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order no., patient, MRN, or test"
            className="h-9 pl-8"
            aria-label="Search worklist"
          />
        </div>
        <Select
          value={priority}
          onValueChange={(v) => setPriority(v as Priority | "ALL")}
        >
          <SelectTrigger
            className="h-9 w-[130px]"
            aria-label="Filter by priority"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All priorities</SelectItem>
            <SelectItem value="STAT">STAT</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
            <SelectItem value="ROUTINE">Routine</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as StatusFilter)}
        >
          <SelectTrigger
            className="h-9 w-[140px]"
            aria-label="Filter by assignment status"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
            <SelectItem value="ASSIGNED">Assigned</SelectItem>
            <SelectItem value="ALL">All statuses</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 w-[140px]"
            aria-label="Ordered from"
          />
          <span>to</span>
          <Input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 w-[140px]"
            aria-label="Ordered to"
          />
        </div>
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 size-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Selection bar */}
      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <span>
            <span className="font-medium">{selectedItems.length}</span> selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRowSelection({})}
            >
              Clear selection
            </Button>
            <Button size="sm" onClick={() => setBulkOpen(true)}>
              <Wand2 className="mr-1.5 size-3.5" />
              Auto-assign selected
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {loadState === "error" ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Could not load the assignment worklist</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              The lab order items could not be retrieved. Check your connection
              and try again.
            </p>
            <Button size="sm" variant="outline" onClick={retry}>
              <RefreshCw className="mr-1.5 size-3.5" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      className={cn(
                        "h-10 whitespace-nowrap",
                        h.column.id === "select" && "w-10",
                        h.column.id === "actions" && "w-28 text-right",
                      )}
                    >
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loadState === "loading" ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((c, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full max-w-[140px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-56 text-center"
                  >
                    {filtersActive ? (
                      <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                        <SearchX className="size-6 text-muted-foreground" />
                        <p className="font-medium">
                          No items match these filters
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try a different search or widen the date range.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={clearFilters}
                        >
                          Clear filters
                        </Button>
                      </div>
                    ) : (
                      <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                        <CheckCircle2 className="size-6 text-emerald-600" />
                        <p className="font-medium">
                          No items waiting for assignment
                        </p>
                        <p className="text-sm text-muted-foreground">
                          New lab order items from HIS will appear here as they
                          arrive.
                        </p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      row.original.priority === "STAT" &&
                        row.original.status === "UNASSIGNED" &&
                        "bg-red-50/50 dark:bg-red-950/10",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "py-2",
                          cell.column.id === "actions" && "text-right",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {loadState === "ready" && total > 0 && (
            <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
              <span>
                {pageIndex * pageSize + 1}–
                {Math.min((pageIndex + 1) * pageSize, total)} of {total} items
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <AssignmentSheet
        item={activeItem}
        allItems={items}
        specimens={specimens}
        onClose={() => setActiveItemId(null)}
        onConfirm={confirmSingle}
      />
      <BulkAutoAssignDialog
        open={bulkOpen}
        items={selectedItems}
        specimens={specimens}
        onClose={() => setBulkOpen(false)}
        onConfirm={confirmBulk}
      />
    </div>
  );
}

function SortHeader({
  column,
  children,
}: {
  column: Column<LabOrderItem, unknown>;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 font-medium"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {children}
      <ArrowUpDown className="ml-1 size-3.5 text-muted-foreground" />
    </Button>
  );
}

function Metric({
  label,
  value,
  hint,
  tone,
  loading,
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: "warn";
  loading?: boolean;
}) {
  return (
    <div className="min-w-[150px] px-4 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="flex items-baseline gap-2">
        {loading ? (
          <Skeleton className="mt-1 h-6 w-8" />
        ) : (
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              tone === "warn" && "text-amber-700 dark:text-amber-400",
            )}
          >
            {value}
          </span>
        )}
        {hint && !loading && (
          <span className="text-xs text-muted-foreground">{hint}</span>
        )}
      </dd>
    </div>
  );
}
