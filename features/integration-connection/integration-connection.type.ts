import {
  getIntegrationConnectionAction,
  getIntegrationConnectionsAction,
} from "./integration-connection.action";

export type IntegrationConnection = Awaited<
  ReturnType<typeof getIntegrationConnectionsAction>
>["data"][number];

export type IntegrationConnectionDetail = NonNullable<
  Awaited<ReturnType<typeof getIntegrationConnectionAction>>["data"]
>;
