"use client";

import Link from "next/link";
import CopyButton from "@/components/ui/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownAction } from "./dropdown-action";
import { Edit, MoreHorizontal } from "lucide-react";
import { useGetIntegrationConnectionActionQuery } from "@/features/integration-connection/integration-connection.api";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export default function IntegrationConnectionOverview({ id }: { id: string }) {
  const { data, isFetching } = useGetIntegrationConnectionActionQuery({ id });

  return (
    <Card className="gap-3">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {isFetching ? (
                <Skeleton className="h-[21px] w-14" />
              ) : data?.data?.isActive ? (
                <Badge
                  variant={"outline"}
                  className={"text-success bg-success/15 border-success/30"}
                >
                  Active
                </Badge>
              ) : (
                <Badge
                  variant={"outline"}
                  className={
                    "text-destructive bg-destructive/15 border-destructive/30"
                  }
                >
                  Inactive
                </Badge>
              )}
              {isFetching ? (
                <Skeleton className="h-[21px] w-20" />
              ) : (
                <Badge variant="secondary">{data?.data?.type}</Badge>
              )}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base">
                {isFetching ? (
                  <Skeleton className="h-5 w-48 mt-2.5 mb-2" />
                ) : (
                  `${data?.data?.name}`
                )}
              </CardTitle>
              <CardDescription>
                Configuration and operational information for this integration
                connection.
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1 justify-end">
            {isFetching ? (
              <Button variant="outline" size="sm" disabled>
                <Edit />
                Edit
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/sys-admin/integration/connections/${data?.data?.id}/edit`}
                >
                  <Edit />
                  Edit
                </Link>
              </Button>
            )}
            {!isFetching && data?.data ? (
              <DropdownAction
                id={data.data.id}
                mode={!data.data.isActive ? "Activate" : "Deactivate"}
                name={data.data.name}
              />
            ) : (
              <Button variant="outline" size="icon-sm" disabled>
                <MoreHorizontal />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-2 sm:grid-cols-4 text-sm">
          <div className="border px-3 py-2 sm:col-span-3 rounded-md">
            <dt className="text-muted-foreground text-xs">Base URL</dt>
            <dd className="font-medium mt-1">
              {isFetching ? (
                <Skeleton className="h-4 w-full max-w-sm mt-[6px] mb-[4px]" />
              ) : data?.data?.baseUrl ? (
                <code className="text-sm relative break-all font-mono">
                  {data.data.baseUrl}
                  <div className="absolute -right-7 -top-[2px]">
                    <CopyButton
                      variant="ghost"
                      className="h-6 w-6"
                      value={data.data.baseUrl}
                    />
                  </div>
                </code>
              ) : (
                <span>Not configured</span>
              )}
            </dd>
          </div>
          <div className="border px-3 py-2 rounded-md">
            <dt className="text-muted-foreground text-xs">Source System</dt>
            <dd className="font-medium mt-1">
              {isFetching ? (
                <Skeleton className="h-4 w-24 mt-[6px] mb-[4px]" />
              ) : (
                data?.data?.sourceSystem
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
