import { z } from "zod";
import { serverFunctionSlice } from "../api/serverFunctionSlice";
import {
  getSpecimenAction,
  createSpecimenAction,
  updateSpecimenAction,
  collectSpecimenAction,
  receiveSpecimenAction,
  reuseSpecimenAction,
  getSpecimenPersonnelCandidatesAction,
} from "./specimen.action";
import {
  GetSpecimenActionSchema,
  CreateSpecimenActionSchema,
  UpdateSpecimenActionSchema,
  CollectSpecimenActionSchema,
  SpecimenReceiptActionSchema,
  ReuseSpecimenActionSchema,
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
      invalidatesTags: (result, err, { id, labOrderId }) => [
        { type: "Specimen", id },
        { type: "Specimen", id: "LIST" },
        // Collecting a specimen starts its order, so the detail header and the
        // status tabs must re-read the order.
        { type: "LabOrder", id: labOrderId },
        ...(result?.data.orderItems ?? []).flatMap(
          ({ labOrderItem: { id } }) => [{ type: "LabOrderItem" as const, id }],
        ),
      ],
    }),
    receiveSpecimenAction: builder.mutation<
      Awaited<ReturnType<typeof receiveSpecimenAction>>,
      z.infer<typeof SpecimenReceiptActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await receiveSpecimenAction(arg);
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
    reuseSpecimenAction: builder.mutation<
      Awaited<ReturnType<typeof reuseSpecimenAction>>,
      z.infer<typeof ReuseSpecimenActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await reuseSpecimenAction(arg);
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
        // Reusing a specimen assigns items, which may belong to several orders,
        // so every affected order has to re-read its assignments. The order
        // detail and the order list both provide the `LabOrderItem` tags below,
        // which is what refreshes them.
        ...(result?.data.orderItems ?? []).flatMap(
          ({ labOrderItem: { id } }) => [{ type: "LabOrderItem" as const, id }],
        ),
      ],
    }),
    getSpecimenPersonnelCandidatesAction: builder.query<
      Awaited<ReturnType<typeof getSpecimenPersonnelCandidatesAction>>,
      void
    >({
      queryFn: async () => {
        try {
          const res = await getSpecimenPersonnelCandidatesAction();
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
  useReceiveSpecimenActionMutation,
  useReuseSpecimenActionMutation,
  useGetSpecimenPersonnelCandidatesActionQuery,
} = apiSlice;
