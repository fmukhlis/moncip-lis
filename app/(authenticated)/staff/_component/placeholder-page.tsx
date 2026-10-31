import { TestTubes } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PlaceholderPage({
  title,
  description,
  message,
}: {
  title: string;
  description: string;
  message?: string;
}) {
  return (
    <div className="relative flex flex-col gap-2 p-2 overflow-y-auto">
      <Card>
        <CardHeader className="gap-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-tight leading-none">
                {title}
              </h1>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <TestTubes className="mb-3 h-9 w-9 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              {message ?? `${title} is not available yet`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              This page will be available in an upcoming update
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
