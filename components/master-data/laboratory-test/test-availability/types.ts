import {
  getLocalTestsAction,
  getMasterTestCategoriesDeepAction,
} from "@/features/master-data/action";

export type MasterCategory = Awaited<
  ReturnType<typeof getMasterTestCategoriesDeepAction>
>["data"][number];

export type MasterTest = MasterCategory["labTests"][number];

export type LocalTest = NonNullable<
  Awaited<ReturnType<typeof getLocalTestsAction>>["data"]
>["labTests"][number];
