import { z } from "zod";
import { serverFunctionSlice } from "../api/serverFunctionSlice";
import {
  getSpecimenAction,
  createSpecimenAction,
  updateSpecimenAction,
  collectSpecimenAction,
  getSpecimenCollectorCandidatesAction,
} from "./specimen.action";
import {
  GetSpecimenActionSchema,
  CreateSpecimenActionSchema,
  UpdateSpecimenActionSchema,
  CollectSpecimenActionSchema,
} from "./specimen.schema";

const apiSlice = serverFunctionSlice.injectEndpoints({
  endpoints: (builder) => ({
    createSpecimenAction: builder.mutation<
      Awaited<ReturnType<typeof createSpecimenAction>>,
      z.infer<typeof CreateSpecimenActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await createSpecimenAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: (result) => [
        { type: "Specimen", id: "LIST" },
        ...(result?.data.orderItems ?? []).flatMap(
          ({ labOrderItem: { id } }) => [{ type: "LabOrderItem" as const, id }],
        ),
      ],
    }),
    getSpecimenAction: builder.query<
      Awaited<ReturnType<typeof getSpecimenAction>>,
      z.infer<typeof GetSpecimenActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getSpecimenAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result, err, { id }) => [
        { type: "Specimen", id },
        ...(result?.data?.orderItems ?? []).flatMap(
          ({ labOrderItem: { id } }) => [{ type: "LabOrderItem" as const, id }],
        ),
      ],
    }),
    updateSpecimenAction: builder.mutation<
      Awaited<ReturnType<typeof updateSpecimenAction>>,
      z.infer<typeof UpdateSpecimenActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await updateSpecimenAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: (result, err, { id }) => [
        { type: "Specimen", id },
        { type: "Specimen", id: "LIST" },
        ...(result?.data.orderItems ?? []).flatMap(
          ({ labOrderItem: { id } }) => [{ type: "LabOrderItem" as const, id }],
        ),
      ],
    }),
    collectSpecimenAction: builder.mutation<
      Awaited<ReturnType<typeof collectSpecimenAction>>,
      z.infer<typeof CollectSpecimenActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await collectSpecimenAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: (result, err, { id }) => [
        { type: "Specimen", id },
        { type: "Specimen", id: "LIST" },
        ...(result?.data.orderItems ?? []).flatMap(
          ({ labOrderItem: { id } }) => [{ type: "LabOrderItem" as const, id }],
        ),
      ],
    }),
    getSpecimenCollectorCandidatesAction: builder.query<
      Awaited<ReturnType<typeof getSpecimenCollectorCandidatesAction>>,
      void
    >({
      queryFn: async () => {
        try {
          const res = await getSpecimenCollectorCandidatesAction();
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    }),
  }),
});

export const {
  useGetSpecimenActionQuery,
  useCreateSpecimenActionMutation,
  useUpdateSpecimenActionMutation,
  useCollectSpecimenActionMutation,
  useGetSpecimenCollectorCandidatesActionQuery,
} = apiSlice;
