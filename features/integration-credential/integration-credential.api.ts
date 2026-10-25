import { z } from "zod";
import { serverFunctionSlice } from "../api/serverFunctionSlice";
import {
  getIntegrationCredentialAction,
  getIntegrationCredentialsAction,
  createIntegrationCredentialAction,
  revokeIntegrationCredentialAction,
  rotateIntegrationCredentialAction,
} from "./integration-credential.action";
import {
  GetIntegrationCredentialActionSchema,
  GetIntegrationCredentialsActionSchema,
  CreateIntegrationCredentialActionSchema,
  RevokeIntegrationCredentialActionSchema,
  RotateIntegrationCredentialActionSchema,
} from "./integration-credential.schema";

const apiSlice = serverFunctionSlice.injectEndpoints({
  endpoints: (builder) => ({
    createIntegrationCredentialAction: builder.mutation<
      Awaited<ReturnType<typeof createIntegrationCredentialAction>>,
      z.infer<typeof CreateIntegrationCredentialActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await createIntegrationCredentialAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: (result, error, { connectionId }) => [
        { type: "IntegrationCredential", id: "LIST" },
        {
          type: "IntegrationConnectionIntegrationCredentials",
          id: connectionId,
        },
      ],
    }),
    getIntegrationCredentialsAction: builder.query<
      Awaited<ReturnType<typeof getIntegrationCredentialsAction>>,
      z.infer<typeof GetIntegrationCredentialsActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getIntegrationCredentialsAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result) => [
        { type: "IntegrationCredential", id: "LIST" },
        ...(result?.data ?? []).flatMap(({ id, connection }) => [
          { type: "IntegrationCredential" as const, id },
          { type: "IntegrationConnection" as const, id: connection.id },
        ]),
      ],
    }),
    getIntegrationCredentialAction: builder.query<
      Awaited<ReturnType<typeof getIntegrationCredentialAction>>,
      z.infer<typeof GetIntegrationCredentialActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getIntegrationCredentialAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result, error, { id }) => [
        { type: "IntegrationCredential", id },
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
    revokeIntegrationCredentialAction: builder.mutation<
      Awaited<ReturnType<typeof revokeIntegrationCredentialAction>>,
      z.infer<typeof RevokeIntegrationCredentialActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await revokeIntegrationCredentialAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "IntegrationCredential", id },
        ...(result?.data.connection
          ? [
              {
                type: "IntegrationConnectionIntegrationCredentials" as const,
                id: result?.data.connection.id,
              },
            ]
          : []),
      ],
    }),
    rotateIntegrationCredentialAction: builder.mutation<
      Awaited<ReturnType<typeof rotateIntegrationCredentialAction>>,
      z.infer<typeof RotateIntegrationCredentialActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await rotateIntegrationCredentialAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "IntegrationCredential", id },
        { type: "IntegrationCredential", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetIntegrationCredentialActionQuery,
  useGetIntegrationCredentialsActionQuery,
  useCreateIntegrationCredentialActionMutation,
  useRevokeIntegrationCredentialActionMutation,
  useRotateIntegrationCredentialActionMutation,
} = apiSlice;
