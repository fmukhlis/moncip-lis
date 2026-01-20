import {
  getLocalTestAction,
  getLocalTestGroupAction,
  getLocalTestGroupsAction,
  getLocalTestsAction,
  getSupportedTariffGroupsAction,
} from "@/features/master-data/action/test-pricing-action";

// Local Test ---------------------------------------------------------------
export type LocalTest = Awaited<ReturnType<typeof getLocalTestAction>>["data"];

export type LocalTestSummary = Awaited<
  ReturnType<typeof getLocalTestsAction>
>["data"][number];
// --------------------------------------------------------------- Local Test

// Local Test Group ---------------------------------------------------------
export type LocalTestGroup = Awaited<
  ReturnType<typeof getLocalTestGroupAction>
>["data"];

export type LocalTestGroupSummary = Awaited<
  ReturnType<typeof getLocalTestGroupsAction>
>["data"][number];
// --------------------------------------------------------- Local Test Group

// Tariff Group -------------------------------------------------------------
export type SupportedTariffGroup = Awaited<
  ReturnType<typeof getSupportedTariffGroupsAction>
>["data"][number];
// ------------------------------------------------------------- Tariff Group
