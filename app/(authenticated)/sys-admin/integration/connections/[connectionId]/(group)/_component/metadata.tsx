"use client";

import CopyButton from "@/components/ui/copy-button";
import ClientDateTimeText from "@/components/ui/client-date-time-text";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetIntegrationConnectionActionQuery } from "@/features/integration-connection/integration-connection.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function IntegrationConnectionDetailMetadata({
  id,
}: {
  id: string;
}) {
  const { data, isFetching } = useGetIntegrationConnectionActionQuery({ id });

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle className="text-base">Metadata</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">Connection ID</p>
          <div className="font-medium">
            <div className="flex items-center gap-1">
              {isFetching ? (
                <Skeleton className="h-4 w-full max-w-[200px] mt-[6px] mb-[2px]" />
              ) : (
                <>
                  <code className="text-sm break-all font-mono">
                    {data?.data?.id}
                  </code>
                  <CopyButton
                    value={data?.data?.id ?? ""}
                    variant="ghost"
                    className="h-6 w-6"
                  />
                </>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">Created</p>
          <div className="font-medium text-sm">
            {isFetching ? (
              <Skeleton className="h-4 w-full max-w-[120px] mt-[6px] mb-[2px]" />
            ) : (
              <ClientDateTimeText
                dateTime={data?.data?.createdAt}
                formatStr="dd MMM yyyy, HH:mm"
              />
            )}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">Updated</p>
          <div className="font-medium text-sm">
            {isFetching ? (
              <Skeleton className="h-4 w-full max-w-[120px] mt-[6px] mb-[2px]" />
            ) : (
              <ClientDateTimeText
                dateTime={data?.data?.updatedAt}
                formatStr="dd MMM yyyy, HH:mm"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
