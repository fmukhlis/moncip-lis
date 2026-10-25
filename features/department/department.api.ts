import { z } from "zod";
import { serverFunctionSlice } from "../api/serverFunctionSlice";
import {
  getDepartmentAction,
  getDepartmentsAction,
  createDepartmentAction,
  updateDepartmentAction,
} from "./department.action";
import {
  GetDepartmentActionSchema,
  GetDepartmentsActionSchema,
  CreateDepartmentActionSchema,
  UpdateDepartmentActionSchema,
} from "./department.schema";

const apiSlice = serverFunctionSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDepartmentAction: builder.mutation<
      Awaited<ReturnType<typeof createDepartmentAction>>,
      z.infer<typeof CreateDepartmentActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await createDepartmentAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: () => [{ type: "Department", id: "LIST" }],
    }),
    getDepartmentsAction: builder.query<
      Awaited<ReturnType<typeof getDepartmentsAction>>,
      z.infer<typeof GetDepartmentsActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getDepartmentsAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result) => [
        { type: "Department", id: "LIST" },
        ...(result?.data ?? []).flatMap(({ id }) => [
          { type: "Department" as const, id },
          { type: "DepartmentLisPerformables" as const, id },
        ]),
      ],
    }),
    getDepartmentAction: builder.query<
      Awaited<ReturnType<typeof getDepartmentAction>>,
      z.infer<typeof GetDepartmentActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getDepartmentAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result, error, { id }) => [
        { type: "Department", id },
        ...(result?.data?.performables ?? []).flatMap(({ id }) => [
          { type: "LisPerformable" as const, id },
        ]),
      ],
    }),
    updateDepartmentAction: builder.mutation<
      Awaited<ReturnType<typeof updateDepartmentAction>>,
      z.infer<typeof UpdateDepartmentActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await updateDepartmentAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Department", id },
        { type: "Department", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetDepartmentActionQuery,
  useGetDepartmentsActionQuery,
  useCreateDepartmentActionMutation,
  useUpdateDepartmentActionMutation,
} = apiSlice;
