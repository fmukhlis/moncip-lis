import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Priority } from "./data";

const STYLES: Record<Priority, { label: string; className: string }> = {
  STAT: {
    label: "STAT",
    className: "border-transparent bg-red-600 text-white",
  },
  URGENT: {
    label: "Urgent",
    className:
      "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200",
  },
  ROUTINE: {
    label: "Routine",
    className: "border-border bg-transparent font-normal text-muted-foreground",
  },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const s = STYLES[priority];
  return (
    <Badge
      variant="outline"
      className={cn("rounded-sm px-1.5 py-0 text-xs", s.className)}
    >
      {s.label}
    </Badge>
  );
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
