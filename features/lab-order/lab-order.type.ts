import { getLabOrderAction, getLabOrdersAction } from "./lab-order.action";

export type LabOrder = Awaited<
  ReturnType<typeof getLabOrdersAction>
>["data"][number];

export type LabOrderDetail = NonNullable<
  Awaited<ReturnType<typeof getLabOrderAction>>["data"]
>;
