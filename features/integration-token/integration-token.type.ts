import {
  getIntegrationTokenAction,
  getIntegrationTokensAction,
} from "./integration-token.action";

export type IntegrationToken = Awaited<
  ReturnType<typeof getIntegrationTokensAction>
>["data"][number];

export type IntegrationTokenDetail = NonNullable<
  Awaited<ReturnType<typeof getIntegrationTokenAction>>
>["data"];
