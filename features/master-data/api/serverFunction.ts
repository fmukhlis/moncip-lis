import z from "zod";

import { serverFunctionSlice } from "@/features/api/serverFunctionSlice";
import {
  getLocalTestAction,
  getLocalTestsAction,
  getLocalTestGroupAction,
  getLocalTestGroupsAction,
  saveLocalTestPricesAction,
  createLocalTestGroupAction,
  markLocalTestOrderableAction,
  getSupportedTariffGroupsAction,
  saveLocalTestGroupPricesAction,
  markLocalTestNotOrderableAction,
  markLocalTestGroupOrderableAction,
  markLocalTestGroupNotOrderableAction,
  unarchiveLocalTestGroupAction,
  archiveLocalTestGroupAction,
} from "../action/test-pricing-action";
import {
  GetLocalTestActionSchema,
  GetLocalTestsActionSchema,
  GetLocalTestGroupActionSchema,
  GetLocalTestGroupsActionSchema,
  SaveLocalTestPricesActionSchema,
  CreateLocalTestGroupActionSchema,
  MarkLocalTestOrderableActionSchema,
  SaveLocalTestGroupPricesActionSchema,
  MarkLocalTestNotOrderableActionSchema,
  MarkLocalTestGroupOrderableActionSchema,
  MarkLocalTestGroupNotOrderableActionSchema,
  UnarchiveLocalTestGroupActionSchema,
  ArchiveLocalTestGroupActionSchema,
} from "../schema/test-pricing-schema";

const apiSlice = serverFunctionSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Queries
    getLocalTest: builder.query<
      Awaited<ReturnType<typeof getLocalTestAction>>,
      z.input<typeof GetLocalTestActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await getLocalTestAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      providesTags: (result, error, arg) => [
        { type: "TestPricing", id: arg.id },
      ],
    }),
    getLocalTests: builder.query<
      Awaited<ReturnType<typeof getLocalTestsAction>>,
      z.input<typeof GetLocalTestsActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await getLocalTestsAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      providesTags: (result, error, arg) => {
        if (!result) {
          return [{ type: "TestPricing", id: "LIST" }];
        }

        return [
          { type: "TestPricing", id: "LIST" },
          ...result.data.map(
            ({ id }) => ({ type: "TestPricing", id }) as const,
          ),
          ,
        ];
      },
    }),
    getLocalTestGroup: builder.query<
      Awaited<ReturnType<typeof getLocalTestGroupAction>>,
      z.input<typeof GetLocalTestGroupActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await getLocalTestGroupAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      providesTags: (result, error, arg) => {
        return [{ type: "PanelPricing", id: arg.id }];
      },
    }),
    getLocalTestGroups: builder.query<
      Awaited<ReturnType<typeof getLocalTestGroupsAction>>,
      z.input<typeof GetLocalTestGroupsActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await getLocalTestGroupsAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      providesTags: (result, error, arg) => {
        if (!result) {
          return [{ type: "PanelPricing", id: "LIST" }];
        }

        return [
          { type: "PanelPricing", id: "LIST" },
          ...result.data.map(
            ({ id }) => ({ type: "PanelPricing", id }) as const,
          ),
        ];
      },
    }),
    getSupportedTariffGroups: builder.query<
      Awaited<ReturnType<typeof getSupportedTariffGroupsAction>>,
      void
    >({
      queryFn: async () => {
        try {
          const response = await getSupportedTariffGroupsAction();
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
    saveLocalTestPrices: builder.mutation<
      Awaited<ReturnType<typeof saveLocalTestPricesAction>>,
      z.input<typeof SaveLocalTestPricesActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await saveLocalTestPricesAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error: {
              message:
                err instanceof Error
                  ? err.message
                  : "Unexpected error occurred.",
            },
          };
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "TestPricing", id: arg.id },
      ],
    }),
    markLocalTestOrderable: builder.mutation<
      Awaited<ReturnType<typeof markLocalTestOrderableAction>>,
      z.input<typeof MarkLocalTestOrderableActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await markLocalTestOrderableAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "TestPricing", id: "LIST" },
        { type: "TestPricing", id: arg.id },
      ],
    }),
    markLocalTestNotOrderable: builder.mutation<
      Awaited<ReturnType<typeof markLocalTestNotOrderableAction>>,
      z.input<typeof MarkLocalTestNotOrderableActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await markLocalTestNotOrderableAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "TestPricing", id: "LIST" },
        { type: "TestPricing", id: arg.id },
      ],
    }),
    createLocalTestGroup: builder.mutation<
      Awaited<ReturnType<typeof createLocalTestGroupAction>>,
      z.input<typeof CreateLocalTestGroupActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await createLocalTestGroupAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "PanelPricing", id: "LIST" },
      ],
    }),
    saveLocalTestGroupPrices: builder.mutation<
      Awaited<ReturnType<typeof saveLocalTestGroupPricesAction>>,
      z.input<typeof SaveLocalTestGroupPricesActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await saveLocalTestGroupPricesAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      invalidatesTags: (result, error, arg) => {
        return [
          { type: "PanelPricing", id: "LIST" },
          { type: "PanelPricing", id: arg.labTestGroupId },
        ];
      },
    }),
    markLocalTestGroupOrderable: builder.mutation<
      Awaited<ReturnType<typeof markLocalTestGroupOrderableAction>>,
      z.input<typeof MarkLocalTestGroupOrderableActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await markLocalTestGroupOrderableAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "PanelPricing", id: "LIST" },
        { type: "PanelPricing", id: arg.id },
      ],
    }),
    markLocalTestGroupNotOrderable: builder.mutation<
      Awaited<ReturnType<typeof markLocalTestGroupNotOrderableAction>>,
      z.input<typeof MarkLocalTestGroupNotOrderableActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await markLocalTestGroupNotOrderableAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "PanelPricing", id: "LIST" },
        { type: "PanelPricing", id: arg.id },
      ],
    }),
    archiveLocalTestGroup: builder.mutation<
      Awaited<ReturnType<typeof archiveLocalTestGroupAction>>,
      z.input<typeof ArchiveLocalTestGroupActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await archiveLocalTestGroupAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      invalidatesTags: (result, error, arg) => {
        return [
          { type: "PanelPricing", id: "LIST" },
          { type: "PanelPricing", id: arg.labTestGroupId },
        ];
      },
    }),
    unarchiveLocalTestGroup: builder.mutation<
      Awaited<ReturnType<typeof unarchiveLocalTestGroupAction>>,
      z.input<typeof UnarchiveLocalTestGroupActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const response = await unarchiveLocalTestGroupAction(arg);
          return { data: response };
        } catch (err) {
          return {
            error:
              err instanceof Error ? err.message : "Unexpected error occurred.",
          };
        }
      },
      invalidatesTags: (result, error, arg) => {
        return [
          { type: "PanelPricing", id: "LIST" },
          { type: "PanelPricing", id: arg.labTestGroupId },
        ];
      },
    }),
  }),
});

export const {
  useGetLocalTestQuery,
  useGetLocalTestsQuery,
  useGetLocalTestGroupQuery,
  useGetLocalTestGroupsQuery,
  useSaveLocalTestPricesMutation,
  useCreateLocalTestGroupMutation,
  useGetSupportedTariffGroupsQuery,
  useArchiveLocalTestGroupMutation,
  useMarkLocalTestOrderableMutation,
  useUnarchiveLocalTestGroupMutation,
  useSaveLocalTestGroupPricesMutation,
  useMarkLocalTestNotOrderableMutation,
  useMarkLocalTestGroupOrderableMutation,
  useMarkLocalTestGroupNotOrderableMutation,
} = apiSlice;
