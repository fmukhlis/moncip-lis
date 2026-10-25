import {
  getOutboundIntegrationEventAction,
  getOutboundIntegrationEventsAction,
} from "./outbound-integration-event.action";

export type OutboundIntegrationEvent = Awaited<
  ReturnType<typeof getOutboundIntegrationEventsAction>
>["data"][number];

export type OutboundIntegrationEventDetail = NonNullable<
  Awaited<ReturnType<typeof getOutboundIntegrationEventAction>>["data"]
>;
