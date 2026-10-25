import { z } from "zod";
import { serverFunctionSlice } from "../api/serverFunctionSlice";
import { getOutboundIntegrationEventsAction } from "./outbound-integration-event.action";
import { GetOutboundIntegrationEventsActionSchema } from "./outbound-integration-event.schema";

const apiSlice = serverFunctionSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOutboundIntegrationEventsAction: builder.query<
      Awaited<ReturnType<typeof getOutboundIntegrationEventsAction>>,
      z.infer<typeof GetOutboundIntegrationEventsActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getOutboundIntegrationEventsAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result) => [
        { type: "OutboundIntegrationEvent", id: "LIST" },
        ...(result?.data ?? []).flatMap(({ id }) => [
          { type: "OutboundIntegrationEvent" as const, id },
        ]),
      ],
    }),
  }),
});

export const { useGetOutboundIntegrationEventsActionQuery } = apiSlice;
