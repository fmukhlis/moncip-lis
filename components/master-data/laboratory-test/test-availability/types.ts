import {
  getLocalTestsAction,
  getTestCategoriesWithTestsAction,
} from "@/features/master-data/action/test-availability-action";

export type MasterCategory = Awaited<
  ReturnType<typeof getTestCategoriesWithTestsAction>
>["data"][number];

export type MasterTest = MasterCategory["labTests"][number];

export type LocalTest = NonNullable<
  Awaited<ReturnType<typeof getLocalTestsAction>>["data"]
>[number]["labTest"];
