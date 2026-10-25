import { z } from "zod";
import { serverFunctionSlice } from "../api/serverFunctionSlice";
import {
  getIntegrationTokenAction,
  getIntegrationTokensAction,
  createIntegrationTokenAction,
  revokeIntegrationTokenAction,
  rotateIntegrationTokenAction,
} from "./integration-token.action";
import {
  GetIntegrationTokenActionSchema,
  GetIntegrationTokensActionSchema,
  CreateIntegrationTokenActionSchema,
  RevokeIntegrationTokenActionSchema,
  RotateIntegrationTokenActionSchema,
} from "./integration-token.schema";

const apiSlice = serverFunctionSlice.injectEndpoints({
  endpoints: (builder) => ({
    createIntegrationTokenAction: builder.mutation<
      Awaited<ReturnType<typeof createIntegrationTokenAction>>,
      z.infer<typeof CreateIntegrationTokenActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await createIntegrationTokenAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: (result, error, { connectionId }) => [
        { type: "IntegrationToken", id: "LIST" },
        {
          type: "IntegrationConnectionIntegrationTokens",
          id: connectionId,
        },
      ],
    }),
    getIntegrationTokensAction: builder.query<
      Awaited<ReturnType<typeof getIntegrationTokensAction>>,
      z.infer<typeof GetIntegrationTokensActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getIntegrationTokensAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result) => [
        { type: "IntegrationToken", id: "LIST" },
        ...(result?.data ?? []).flatMap(({ id, connection }) => [
          { type: "IntegrationToken" as const, id },
          { type: "IntegrationConnection" as const, id: connection.id },
        ]),
      ],
    }),
    getIntegrationTokenAction: builder.query<
      Awaited<ReturnType<typeof getIntegrationTokenAction>>,
      z.infer<typeof GetIntegrationTokenActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getIntegrationTokenAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result, error, { id }) => [
        { type: "IntegrationToken", id },
        ...(result?.data?.connection
          ? [
              {
                type: "IntegrationConnection" as const,
                id: result.data.connection.id,
              },
            ]
          : []),
      ],
    }),
    revokeIntegrationTokenAction: builder.mutation<
      Awaited<ReturnType<typeof revokeIntegrationTokenAction>>,
      z.infer<typeof RevokeIntegrationTokenActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await revokeIntegrationTokenAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "IntegrationToken", id },
        ...(result?.data.connection
          ? [
              {
                type: "IntegrationConnectionIntegrationTokens" as const,
                id: result.data.connection.id,
              },
            ]
          : []),
      ],
    }),
    rotateIntegrationTokenAction: builder.mutation<
      Awaited<ReturnType<typeof rotateIntegrationTokenAction>>,
      z.infer<typeof RotateIntegrationTokenActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await rotateIntegrationTokenAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "IntegrationToken", id },
        { type: "IntegrationToken", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetIntegrationTokenActionQuery,
  useGetIntegrationTokensActionQuery,
  useCreateIntegrationTokenActionMutation,
  useRevokeIntegrationTokenActionMutation,
  useRotateIntegrationTokenActionMutation,
} = apiSlice;
