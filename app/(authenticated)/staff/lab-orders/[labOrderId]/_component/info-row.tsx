import { Skeleton } from "@/components/ui/skeleton";

export function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-sm font-medium leading-snug">{value ?? "—"}</div>
    </div>
  );
}

export function InfoRowSkeleton({ label = "" }: { label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Skeleton className="w-28 h-[17px]" />
    </div>
  );
}
