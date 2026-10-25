import {
  getIntegrationCredentialAction,
  getIntegrationCredentialsAction,
} from "./integration-credential.action";

export type IntegrationCredential = Awaited<
  ReturnType<typeof getIntegrationCredentialsAction>
>["data"][number];

export type IntegrationCredentialDetail = NonNullable<
  Awaited<ReturnType<typeof getIntegrationCredentialAction>>
>["data"];
