import { z } from "zod";
import { serverFunctionSlice } from "../api/serverFunctionSlice";
import { getUnitAction, getUnitsAction } from "./unit.action";
import { GetUnitActionSchema, GetUnitsActionSchema } from "./unit.schema";

const apiSlice = serverFunctionSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUnitsAction: builder.query<
      Awaited<ReturnType<typeof getUnitsAction>>,
      z.infer<typeof GetUnitsActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getUnitsAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result) => [
        { type: "Unit", id: "LIST" },
        ...(result?.data ?? []).flatMap(({ id }) => [
          { type: "Unit" as const, id },
        ]),
      ],
    }),
    getUnitAction: builder.query<
      Awaited<ReturnType<typeof getUnitAction>>,
      z.infer<typeof GetUnitActionSchema>
    >({
      queryFn: async (arg) => {
        try {
          const res = await getUnitAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result, error, { id }) => [{ type: "Unit" as const, id }],
    }),
  }),
});

export const { useGetUnitActionQuery, useGetUnitsActionQuery } = apiSlice;
