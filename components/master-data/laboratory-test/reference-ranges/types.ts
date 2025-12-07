import { getLocalTestsWithReferenceRangesAction } from "@/features/master-data/action/reference-ranges-action";

export type LocalTest = Awaited<
  ReturnType<typeof getLocalTestsWithReferenceRangesAction>
>["data"][number];
