import {
  getLisPerformableAction,
  getLisPerformablesAction,
} from "./lis-performable.action";

export type LisPerformable = Awaited<
  ReturnType<typeof getLisPerformablesAction>
>["data"][number];

export type LisPerformableDetail = NonNullable<
  Awaited<ReturnType<typeof getLisPerformableAction>>["data"]
>;
