import { Badge } from "@/components/ui/badge";
import { Layers, TestTube } from "lucide-react";
import { PERFORMABLE_TYPE_LABEL } from "./label";

export default function PerformableTypeBadge({
  type,
}: {
  type: keyof typeof PERFORMABLE_TYPE_LABEL;
}) {
  return (
    <Badge variant={"secondary"}>
      {type === "PANEL" ? (
        <Layers className="size-3" />
      ) : (
        <TestTube className="size-3" />
      )}
      {PERFORMABLE_TYPE_LABEL[type]}
    </Badge>
  );
}
