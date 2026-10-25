import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";

export default function StatCard({
  title,
  value,
  isLoading = false,
}: {
  title: string;
  value: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="gap-1 text-center">
          <CardTitle className="text-sm text-muted-foreground">
            {title}
          </CardTitle>
          <CardDescription className="text-xl font-semibold text-foreground">
            <Skeleton className="h-6 w-10 mx-auto mt-1" />
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="gap-1 text-center">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <CardDescription className="text-xl font-semibold text-foreground">
          {value}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
