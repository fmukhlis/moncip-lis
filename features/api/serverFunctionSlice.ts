import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export const serverFunctionSlice = createApi({
  reducerPath: "serverFunction",
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    "Patient",

    "ExternalLabOrderable",
    "ExternalLabOrderableLisPerformables",

    "IntegrationConnection",
    "IntegrationConnectionIntegrationTokens",
    "IntegrationConnectionExternalLabOrderables",
    "IntegrationConnectionIntegrationCredentials",
    "IntegrationConnectionInboundIntegrationEvents",

    "IntegrationToken",
    "IntegrationCredential",
    "InboundIntegrationEvent",
    "OutboundIntegrationEvent",

    "Department",
    "DepartmentLisPerformables",

    "User",

    "LisPerformable",
    "LisPerformableLisResultComponents",

    "LisResultComponent",
    "SpecimenType",

    "Unit",

    "LabOrder",
    "LabOrderInboundIntegrationEvents",

    "LabOrderItem",

    "Specimen",
  ],
  endpoints: () => ({}),
});
