import { z } from "zod";
import { serverFunctionSlice } from "../api/serverFunctionSlice";
import { getLabOrderAction, getLabOrdersAction } from "./lab-order.action";
import {
  GetLabOrderActionSchema,
  GetLabOrdersActionSchema,
} from "./lab-order.schema";

const apiSlice = serverFunctionSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLabOrdersAction: builder.query<
      Awaited<ReturnType<typeof getLabOrdersAction>>,
      z.infer<typeof GetLabOrdersActionSchema>
    >({
      queryFn: async (params) => {
        try {
          const res = await getLabOrdersAction(params);
          return {
            data: res,
          };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result) => [
        { type: "Department", id: "LIST" },
        ...(result?.data ?? []).flatMap(({ id, patient, items }) => [
          { type: "Patient" as const, id: patient.id },
          { type: "LabOrder" as const, id },
          ...items.flatMap(({ id }) => [{ type: "LabOrderItem" as const, id }]),
        ]),
      ],
    }),
    getLabOrderAction: builder.query<
      Awaited<ReturnType<typeof getLabOrderAction>>,
      z.infer<typeof GetLabOrderActionSchema>
    >({
      queryFn: async (params) => {
        try {
          const res = await getLabOrderAction(params);
          return {
            data: res,
          };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result, error, { id }) => [
        { type: "LabOrder" as const, id },
        ...(result?.data?.specimens ?? []).flatMap(({ id }) => [
          { type: "Specimen" as const, id },
        ]),
        ...(result?.data?.patient
          ? [
              {
                type: "Patient" as const,
                id: result.data.patient.id,
              },
            ]
          : []),
        ...(result?.data?.inboundEvents ?? []).flatMap(({ id }) => [
          { type: "InboundIntegrationEvent" as const, id },
        ]),
        ...(result?.data?.items ?? []).flatMap(({ id }) => [
          { type: "LabOrderItem" as const, id },
        ]),
      ],
    }),
  }),
});

export const { useGetLabOrderActionQuery, useGetLabOrdersActionQuery } =
  apiSlice;
