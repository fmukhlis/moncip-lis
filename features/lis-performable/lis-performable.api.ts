import { z } from "zod";
import { serverFunctionSlice } from "../api/serverFunctionSlice";
import {
  getLisPerformableAction,
  getLisPerformablesAction,
  createLisPerformableAction,
  updateLisPerformableAction,
} from "./lis-performable.action";
import {
  GetLisPerformableActionSchema,
  GetLisPerformablesActionSchema,
  CreateLisPerformableActionSchema,
  UpdateLisPerformableActionSchema,
} from "./lis-performable.schema";

const apiSlice = serverFunctionSlice.injectEndpoints({
  endpoints: (builder) => ({
    createLisPerformableAction: builder.mutation<
      Awaited<ReturnType<typeof createLisPerformableAction>>,
      z.infer<typeof CreateLisPerformableActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await createLisPerformableAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: (
        result,
        error,
        { departmentId, externalOrderableId },
      ) => [
        { type: "LisPerformable", id: "LIST" },
        { type: "DepartmentLisPerformables", id: departmentId },
        {
          type: "ExternalLabOrderableLisPerformables",
          id: externalOrderableId,
        },
      ],
    }),
    getLisPerformablesAction: builder.query<
      Awaited<ReturnType<typeof getLisPerformablesAction>>,
      z.infer<typeof GetLisPerformablesActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getLisPerformablesAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result) => [
        { type: "LisPerformable", id: "LIST" },
        ...(result?.data ?? []).flatMap(({ id }) => [
          { type: "LisPerformable" as const, id },
          { type: "LisPerformableLisResultComponents" as const, id },
        ]),
      ],
    }),
    getLisPerformableAction: builder.query<
      Awaited<ReturnType<typeof getLisPerformableAction>>,
      z.infer<typeof GetLisPerformableActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getLisPerformableAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result, error, { id }) => [
        { type: "LisPerformable", id },
        { type: "LisPerformableLisResultComponents", id },
        ...(result?.data?.resultComponents ?? []).flatMap(
          ({ id }) => [{ type: "LisResultComponent", id }] as const,
        ),
      ],
    }),
    updateLisPerformableAction: builder.mutation<
      Awaited<ReturnType<typeof updateLisPerformableAction>>,
      z.infer<typeof UpdateLisPerformableActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await updateLisPerformableAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: (result, error, { id, departmentId }) => [
        { type: "LisPerformable", id },
        { type: "LisPerformable", id: "LIST" },
        ...(departmentId
          ? [
              {
                type: "DepartmentLisPerformables" as const,
                id: departmentId,
              },
            ]
          : []),
      ],
    }),
  }),
});

export const {
  useGetLisPerformableActionQuery,
  useGetLisPerformablesActionQuery,
  useCreateLisPerformableActionMutation,
  useUpdateLisPerformableActionMutation,
} = apiSlice;
