import { z } from "zod";
import { serverFunctionSlice } from "../api/serverFunctionSlice";
import {
  syncExternalLabOrderablesAction,
  getStoredExternalLabOrderableAction,
  getStoredExternalLabOrderablesAction,
} from "./external-lab-orderable.action";
import {
  SyncExternalLabOrderablesActionSchema,
  GetStoredExternalLabOrderableActionSchema,
  GetStoredExternalLabOrderablesActionSchema,
} from "./external-lab-orderable.schema";

const apiSlice = serverFunctionSlice.injectEndpoints({
  endpoints: (builder) => ({
    syncExternalLabOrderablesAction: builder.mutation<
      Awaited<ReturnType<typeof syncExternalLabOrderablesAction>>,
      z.infer<typeof SyncExternalLabOrderablesActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await syncExternalLabOrderablesAction(arg);
          return { data: res };
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: error instanceof Error ? error.message : "Unknown error",
            },
          };
        }
      },
      invalidatesTags: () => [
        // The server function called in this endpoint creates an outbound
        // integration event and upserts the external lab orderable. So it should
        // invalidate these tags:
        // 1. 'ExternalLabOrderable'.
        // 2. 'OutboundIntegrationEvent'.
        // 3. 'IntegrationConnectionExternalLabOrderables'. (This is also required because syncing
        // would likely change the count of external lab orderables for the integration connection.)
        { type: "ExternalLabOrderable" },
        { type: "OutboundIntegrationEvent" },
        { type: "IntegrationConnectionExternalLabOrderables" },
      ],
    }),
    getStoredExternalLabOrderablesAction: builder.query<
      Awaited<ReturnType<typeof getStoredExternalLabOrderablesAction>>,
      z.infer<typeof GetStoredExternalLabOrderablesActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getStoredExternalLabOrderablesAction(arg);
          return { data: res };
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: error instanceof Error ? error.message : "Unknown error",
            },
          };
        }
      },
      providesTags: (result) => [
        { type: "ExternalLabOrderable", id: "LIST" },
        ...(result?.data ?? []).flatMap(({ id, performables }) => [
          { type: "ExternalLabOrderable" as const, id },
          { type: "ExternalLabOrderableLisPerformables" as const, id },
          ...(performables ?? []).flatMap(({ id, department }) => [
            { type: "LisPerformable" as const, id },
            ...(department
              ? [{ type: "Department" as const, id: department.id }]
              : []),
          ]),
        ]),
      ],
    }),
    getStoredExternalLabOrderableAction: builder.query<
      Awaited<ReturnType<typeof getStoredExternalLabOrderableAction>>,
      z.infer<typeof GetStoredExternalLabOrderableActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getStoredExternalLabOrderableAction(arg);
          return { data: res };
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: error instanceof Error ? error.message : "Unknown error",
            },
          };
        }
      },
      providesTags: (result, error, { id }) => [
        { type: "ExternalLabOrderable", id },
        { type: "ExternalLabOrderableLisPerformables" as const, id },
        ...(result?.data?.connection
          ? [
              {
                type: "IntegrationConnection" as const,
                id: result.data.connection.id,
              },
            ]
          : []),
        ...(result?.data?.performables ?? []).flatMap(
          ({ id, department, specimenTypes }) => [
            { type: "LisPerformable" as const, id },
            { type: "LisPerformableLisResultComponents" as const, id },
            ...(department
              ? [{ type: "Department" as const, id: department.id }]
              : []),
            ...(specimenTypes ?? []).flatMap(({ specimenType: { id } }) => [
              { type: "SpecimenType" as const, id },
            ]),
          ],
        ),
      ],
    }),
  }),
});

export const {
  useSyncExternalLabOrderablesActionMutation,
  useGetStoredExternalLabOrderableActionQuery,
  useGetStoredExternalLabOrderablesActionQuery,
} = apiSlice;
