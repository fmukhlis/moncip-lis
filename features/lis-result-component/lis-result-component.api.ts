import { z } from "zod";
import { serverFunctionSlice } from "../api/serverFunctionSlice";
import {
  getLisResultComponentAction,
  getLisResultComponentsAction,
  createLisResultComponentAction,
  updateLisResultComponentAction,
  updateLisResultComponentsOrderAction,
} from "./lis-result-component.action";
import {
  GetLisResultComponentActionSchema,
  GetLisResultComponentsActionSchema,
  CreateLisResultComponentActionSchema,
  UpdateLisResultComponentApiSchema,
  UpdateLisResultComponentsOrderApiSchema,
} from "./lis-result-component.schema";

const apiSlice = serverFunctionSlice.injectEndpoints({
  endpoints: (builder) => ({
    createLisResultComponentAction: builder.mutation<
      Awaited<ReturnType<typeof createLisResultComponentAction>>,
      z.infer<typeof CreateLisResultComponentActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await createLisResultComponentAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: (result, error, { performableId }) => [
        { type: "LisResultComponent", id: "LIST" },
        { type: "LisPerformableLisResultComponents", id: performableId },
      ],
    }),
    getLisResultComponentsAction: builder.query<
      Awaited<ReturnType<typeof getLisResultComponentsAction>>,
      z.infer<typeof GetLisResultComponentsActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getLisResultComponentsAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result) => [
        { type: "LisResultComponent", id: "LIST" },
        ...(result?.data ?? []).flatMap(({ id, unit }) => [
          { type: "Unit" as const, id: unit?.id },
          { type: "LisResultComponent" as const, id },
        ]),
      ],
    }),
    getLisResultComponentAction: builder.query<
      Awaited<ReturnType<typeof getLisResultComponentAction>>,
      z.infer<typeof GetLisResultComponentActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getLisResultComponentAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result, error, { id }) => [
        { type: "LisResultComponent", id },
        ...(result?.data?.unit
          ? [{ type: "Unit" as const, id: result.data.unit.id }]
          : []),
      ],
    }),
    updateLisResultComponentAction: builder.mutation<
      Awaited<ReturnType<typeof updateLisResultComponentAction>>,
      z.infer<typeof UpdateLisResultComponentApiSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await updateLisResultComponentAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: (result, error, { id, performableId }) => [
        { type: "LisResultComponent", id },
        ...(performableId
          ? [
              {
                type: "LisPerformableLisResultComponents" as const,
                id: performableId,
              },
            ]
          : []),
      ],
    }),
    updateLisResultComponentsOrderAction: builder.mutation<
      Awaited<ReturnType<typeof updateLisResultComponentsOrderAction>>,
      z.infer<typeof UpdateLisResultComponentsOrderApiSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await updateLisResultComponentsOrderAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: (result, error, { lisResultComponents }) => [
        ...lisResultComponents.flatMap(({ id }) => [
          {
            type: "LisResultComponent" as const,
            id,
          },
        ]),
      ],
    }),
  }),
});

export const {
  useGetLisResultComponentActionQuery,
  useGetLisResultComponentsActionQuery,
  useCreateLisResultComponentActionMutation,
  useUpdateLisResultComponentActionMutation,
  useUpdateLisResultComponentsOrderActionMutation,
} = apiSlice;
