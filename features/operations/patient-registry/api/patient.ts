import { serverFunctionSlice } from "@/features/api/serverFunctionSlice";
import { getLocalPatientAction, getLocalPatientsAction } from "../action/query";
import z from "zod";
import {
  CreateLocalPatientHISActionSchema,
  CreateLocalPatientManualActionSchema,
  DeleteLocalPatientActionSchema,
  GetLocalPatientActionSchema,
  GetLocalPatientsActionSchema,
  GetPatientFromHISActionSchema,
  SyncLocalPatientHISActionSchema,
  UpdateLocalPatientManualActionSchema,
} from "../schema";
import { getPatientsFromHISAction } from "../action/integration";
import {
  createLocalPatientHISAction,
  createLocalPatientManualAction,
  deleteLocalPatientAction,
  syncLocalPatientHISAction,
  updateLocalPatientManualAction,
} from "../action/mutation";

const apiSlice = serverFunctionSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Queries
    getLocalPatientAction: builder.query<
      Awaited<ReturnType<typeof getLocalPatientAction>>,
      z.input<typeof GetLocalPatientActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await getLocalPatientAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      providesTags: (result, error, arg) => [
        { type: "PatientRegistry", id: arg.id },
      ],
    }),
    getLocalPatientsAction: builder.query<
      Awaited<ReturnType<typeof getLocalPatientsAction>>,
      z.input<typeof GetLocalPatientsActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await getLocalPatientsAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      providesTags: (result) => {
        if (!result) {
          return [{ type: "PatientRegistry", id: "LIST" }];
        }
        return [
          { type: "PatientRegistry", id: "LIST" },
          ...result.data.map(
            ({ id }) => ({ type: "PatientRegistry", id }) as const,
          ),
        ];
      },
    }),
    getPatientsFromHISAction: builder.query<
      Awaited<ReturnType<typeof getPatientsFromHISAction>>,
      z.input<typeof GetPatientFromHISActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await getPatientsFromHISAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
    }),

    // Mutations
    createLocalPatientHISAction: builder.mutation<
      Awaited<ReturnType<typeof createLocalPatientHISAction>>,
      z.input<typeof CreateLocalPatientHISActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await createLocalPatientHISAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      invalidatesTags: () => [{ type: "PatientRegistry", id: "LIST" }],
    }),
    createLocalPatientManualAction: builder.mutation<
      Awaited<ReturnType<typeof createLocalPatientManualAction>>,
      z.input<typeof CreateLocalPatientManualActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await createLocalPatientManualAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      invalidatesTags: () => [{ type: "PatientRegistry", id: "LIST" }],
    }),
    updateLocalPatientManualAction: builder.mutation<
      Awaited<ReturnType<typeof updateLocalPatientManualAction>>,
      z.input<typeof UpdateLocalPatientManualActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await updateLocalPatientManualAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "PatientRegistry", id: "LIST" },
        { type: "PatientRegistry", id: arg.id },
      ],
    }),
    syncLocalPatientHISAction: builder.mutation<
      Awaited<ReturnType<typeof syncLocalPatientHISAction>>,
      z.input<typeof SyncLocalPatientHISActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await syncLocalPatientHISAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "PatientRegistry", id: "LIST" },
        { type: "PatientRegistry", id: arg.id },
      ],
    }),
    deleteLocalPatientAction: builder.mutation<
      Awaited<ReturnType<typeof deleteLocalPatientAction>>,
      z.input<typeof DeleteLocalPatientActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await deleteLocalPatientAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "PatientRegistry", id: "LIST" },
        { type: "PatientRegistry", id: arg.id },
      ],
    }),
  }),
});

export const {
  useGetLocalPatientActionQuery,
  useGetLocalPatientsActionQuery,
  useGetPatientsFromHISActionQuery,
  useDeleteLocalPatientActionMutation,
  useLazyGetPatientsFromHISActionQuery,
  useSyncLocalPatientHISActionMutation,
  useCreateLocalPatientHISActionMutation,
  useCreateLocalPatientManualActionMutation,
  useUpdateLocalPatientManualActionMutation,
} = apiSlice;
