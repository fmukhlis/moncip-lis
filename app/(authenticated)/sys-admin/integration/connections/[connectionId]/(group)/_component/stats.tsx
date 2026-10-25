"use client";

import StatCard from "./stat-card";
import { getTokenStatus } from "../../../_lib/get-token-status";
import { getCredentialStatus } from "../../../_lib/get-credential-status";
import { useGetIntegrationConnectionActionQuery } from "@/features/integration-connection/integration-connection.api";

export default function IntegrationConnectionDetailStats({
  id,
}: {
  id: string;
}) {
  const { data, isFetching } = useGetIntegrationConnectionActionQuery({ id });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <StatCard
        title="Total Tokens"
        value={`${data?.data?.tokens.length ?? "—"}`}
        isLoading={isFetching}
      />
      <StatCard
        title="Active Tokens"
        value={`${data?.data?.tokens.filter((t) => getTokenStatus(t) === "ACTIVE").length ?? "—"}`}
        isLoading={isFetching}
      />
      <StatCard
        title="Total Credentials"
        value={`${data?.data?.credentials.length ?? "—"}`}
        isLoading={isFetching}
      />
      <StatCard
        title="Active Credentials"
        value={`${data?.data?.credentials.filter((t) => getCredentialStatus(t) === "ACTIVE").length ?? "—"}`}
        isLoading={isFetching}
      />
    </div>
  );
}
