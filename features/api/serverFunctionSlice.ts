import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export const serverFunctionSlice = createApi({
  reducerPath: "serverFunction",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["TestPricing", "PanelPricing", "PatientRegistry"],
  endpoints: () => ({}),
});
