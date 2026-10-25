import { getInboundIntegrationEventsAction } from "./inbound-integration-event.action";

export type InboundIntegrationEvent = Awaited<
  ReturnType<typeof getInboundIntegrationEventsAction>
>["data"][number];
