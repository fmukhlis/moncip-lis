import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CircleSmall } from "lucide-react";
import { STATUS_LABEL } from "./labels";

export default function LabOrderStatusBadge({
  status,
}: {
  status: keyof typeof STATUS_LABEL;
}) {
  return (
    <Badge variant="outline">
      <CircleSmall
        className={cn(
          status === "ORDERED" ? "fill-info/70 text-info" : "",
          status === "IN_PROCESS" ? "fill-warning/70 text-warning" : "",
          status === "COMPLETED" ? "fill-success/70 text-success" : "",
          status === "CANCELLED" ? "fill-destructive/70 text-destructive" : "",
        )}
      />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
