import { Badge } from "@/components/ui/badge";
import { CircleSmall } from "lucide-react";
import { LAB_ORDER_ITEM_STATUS } from "./label";

export default function LabOrderItemStatusBadge({
  status,
}: {
  status: keyof typeof LAB_ORDER_ITEM_STATUS;
}) {
  let className = "";

  switch (status) {
    case "ORDERED":
      className = "fill-info/70 text-info";
      break;
    case "IN_PROCESS":
      className = "fill-warning/70 text-warning";
      break;
    case "PRELIMINARY":
      className = "fill-teal-600/70 text-teal-600";
      break;
    case "VERIFIED":
      className = "fill-success/70 text-success";
      break;
    case "TNP":
      className = "fill-muted-foreground/70 text-muted-foreground";
      break;
    case "REJECTED":
      className = "fill-pink-600/70 text-pink-600";
      break;
    case "CANCELLED":
      className = "fill-destructive/70 text-destructive";
      break;
  }

  return (
    <Badge variant={"outline"}>
      <CircleSmall className={className} />
      {LAB_ORDER_ITEM_STATUS[status]}
    </Badge>
  );
}
