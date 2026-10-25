import { z } from "zod";
import { serverFunctionSlice } from "../api/serverFunctionSlice";
import {
  getUserAction,
  getUsersAction,
  createUserAction,
  deleteUserAction,
  updateUserAction,
} from "./user.action";
import {
  GetUserActionSchema,
  GetUsersActionSchema,
  CreateUserActionSchema,
  DeleteUserActionSchema,
  UpdateUserActionSchema,
} from "./user.schema";

const apiSlice = serverFunctionSlice.injectEndpoints({
  endpoints: (builder) => ({
    createUserAction: builder.mutation<
      Awaited<ReturnType<typeof createUserAction>>,
      z.infer<typeof CreateUserActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await createUserAction(arg);
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
      invalidatesTags: () => [{ type: "User", id: "LIST" }],
    }),
    getUsersAction: builder.query<
      Awaited<ReturnType<typeof getUsersAction>>,
      z.infer<typeof GetUsersActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getUsersAction(arg);
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
        { type: "User", id: "LIST" },
        ...(result?.data ?? []).flatMap(({ id, department }) => [
          { type: "User" as const, id },
          ...(department
            ? [{ type: "Department" as const, id: department?.id }]
            : []),
        ]),
      ],
    }),
    getUserAction: builder.query<
      Awaited<ReturnType<typeof getUserAction>>,
      z.infer<typeof GetUserActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getUserAction(arg);
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
        { type: "User", id },
        ...(result?.data?.department
          ? [{ type: "Department" as const, id: result.data.department.id }]
          : []),
      ],
    }),
    updateUserAction: builder.mutation<
      Awaited<ReturnType<typeof updateUserAction>>,
      z.infer<typeof UpdateUserActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await updateUserAction(arg);
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
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
    deleteUserAction: builder.mutation<
      Awaited<ReturnType<typeof deleteUserAction>>,
      z.infer<typeof DeleteUserActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await deleteUserAction(arg);
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
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
  }),
});

export const {
  useGetUserActionQuery,
  useGetUsersActionQuery,
  useCreateUserActionMutation,
  useDeleteUserActionMutation,
  useUpdateUserActionMutation,
} = apiSlice;
