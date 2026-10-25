"use client";

import { useGetIntegrationConnectionsActionQuery } from "@/features/integration-connection/integration-connection.api";
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";

export default function ConnectionsCount() {
  const activeConnections = useGetIntegrationConnectionsActionQuery({
    isActive: true,
  });
  const inactiveConnections = useGetIntegrationConnectionsActionQuery({
    isActive: false,
  });

  const activeConnectionsCount = activeConnections.data?.data.length ?? 0;
  const inactiveConnectionsCount = inactiveConnections.data?.data.length ?? 0;
  const totalConnectionsCount =
    activeConnectionsCount + inactiveConnectionsCount;

  return (
    <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
      <Card>
        <CardHeader>
          <CardDescription>Total Connections</CardDescription>
          <CardTitle>{totalConnectionsCount}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Active Connections</CardDescription>
          <CardTitle>{activeConnectionsCount}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
