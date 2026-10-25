import { z } from "zod";
import { serverFunctionSlice } from "../api/serverFunctionSlice";
import {
  getIntegrationConnectionAction,
  getIntegrationConnectionsAction,
  createIntegrationConnectionAction,
  updateIntegrationConnectionAction,
} from "./integration-connection.action";
import {
  GetIntegrationConnectionActionSchema,
  GetIntegrationConnectionsActionSchema,
  CreateIntegrationConnectionActionSchema,
  UpdateIntegrationConnectionActionSchema,
} from "./integration-connection.schema";

const apiSlice = serverFunctionSlice.injectEndpoints({
  endpoints: (builder) => ({
    createIntegrationConnectionAction: builder.mutation<
      Awaited<ReturnType<typeof createIntegrationConnectionAction>>,
      z.infer<typeof CreateIntegrationConnectionActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await createIntegrationConnectionAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: [{ type: "IntegrationConnection", id: "LIST" }],
    }),
    getIntegrationConnectionsAction: builder.query<
      Awaited<ReturnType<typeof getIntegrationConnectionsAction>>,
      z.infer<typeof GetIntegrationConnectionsActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getIntegrationConnectionsAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result) => [
        { type: "IntegrationConnection", id: "LIST" },
        ...(result?.data ?? []).flatMap(
          ({ id }) =>
            [
              { type: "IntegrationConnection", id },
              { type: "IntegrationConnectionIntegrationTokens", id },
              { type: "IntegrationConnectionIntegrationCredentials", id },
              { type: "IntegrationConnectionInboundIntegrationEvents", id },
            ] as const,
        ),
      ],
    }),
    getIntegrationConnectionAction: builder.query<
      Awaited<ReturnType<typeof getIntegrationConnectionAction>>,
      z.infer<typeof GetIntegrationConnectionActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getIntegrationConnectionAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result, error, { id }) => [
        { type: "IntegrationConnection", id },
        { type: "IntegrationConnectionIntegrationTokens", id },
        { type: "IntegrationConnectionExternalLabOrderables", id },
        { type: "IntegrationConnectionIntegrationCredentials", id },
        { type: "IntegrationConnectionInboundIntegrationEvents", id },
        ...(result?.data?.tokens ?? []).flatMap(
          ({ id }) => [{ type: "IntegrationToken", id }] as const,
        ),
        ...(result?.data?.credentials ?? []).flatMap(
          ({ id }) => [{ type: "IntegrationCredential", id }] as const,
        ),
      ],
    }),
    updateIntegrationConnectionAction: builder.mutation<
      Awaited<ReturnType<typeof updateIntegrationConnectionAction>>,
      z.infer<typeof UpdateIntegrationConnectionActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await updateIntegrationConnectionAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "IntegrationConnection", id },
      ],
    }),
  }),
});

export const {
  useGetIntegrationConnectionActionQuery,
  useGetIntegrationConnectionsActionQuery,
  useCreateIntegrationConnectionActionMutation,
  useUpdateIntegrationConnectionActionMutation,
} = apiSlice;
