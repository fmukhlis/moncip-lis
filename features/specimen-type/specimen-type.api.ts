import { serverFunctionSlice } from "../api/serverFunctionSlice";
import { getSpecimenTypesAction } from "./specimen-type.action";

const apiSlice = serverFunctionSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSpecimenTypesAction: builder.query({
      queryFn: async (arg) => {
        try {
          const res = await getSpecimenTypesAction(arg);
          return { data: res };
        } catch (error) {
          return {
            status: "CUSTOM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      providesTags: (result) => [
        { type: "SpecimenType" as const, id: "LIST" },
        ...(result?.data ?? []).flatMap(({ id }) => [
          { type: "SpecimenType" as const, id },
        ]),
      ],
    }),
  }),
});

export const { useGetSpecimenTypesActionQuery } = apiSlice;
