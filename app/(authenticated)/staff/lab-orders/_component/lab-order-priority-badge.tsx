import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABEL } from "./labels";

export default function LabOrderPriorityBadge({
  priority,
}: {
  priority: keyof typeof PRIORITY_LABEL;
}) {
  return (
    <Badge
      className={cn(
        priority === "ROUTINE"
          ? "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/30"
          : "",
        priority === "STAT"
          ? "bg-destructive/10 text-destructive border-destructive/30"
          : "",
        priority === "URGENT"
          ? "bg-warning/10 text-warning border-warning/30"
          : "",
      )}
    >
      {PRIORITY_LABEL[priority]}
    </Badge>
  );
}
