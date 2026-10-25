import { Badge } from "@/components/ui/badge";
import { CircleSmall } from "lucide-react";
import { SPECIMEN_STATUS } from "./label";

export default function SpecimenStatusBadge({
  status,
}: {
  status: keyof typeof SPECIMEN_STATUS;
}) {
  let className = "";

  switch (status) {
    case "PENDING":
      className = "fill-info/70 text-info";
      break;
    case "COLLECTED":
      className = "fill-indigo-600/70 text-indigo-600";
      break;
    case "RECEIVED":
      className = "fill-purple-600/70 text-purple-600";
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
      {SPECIMEN_STATUS[status]}
    </Badge>
  );
}
