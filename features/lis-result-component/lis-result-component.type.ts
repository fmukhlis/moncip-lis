import {
  getLisResultComponentAction,
  getLisResultComponentsAction,
} from "./lis-result-component.action";

export type LisResultComponent = Awaited<
  ReturnType<typeof getLisResultComponentsAction>
>["data"][number];

export type LisResultComponentDetail = NonNullable<
  Awaited<ReturnType<typeof getLisResultComponentAction>>["data"]
>;
