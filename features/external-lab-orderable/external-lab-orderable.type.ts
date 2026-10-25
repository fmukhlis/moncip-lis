import {
  getStoredExternalLabOrderableAction,
  getStoredExternalLabOrderablesAction,
} from "./external-lab-orderable.action";

export type StoredExternalLabOrderable = Awaited<
  ReturnType<typeof getStoredExternalLabOrderablesAction>
>["data"][number];

export type StoredExternalLabOrderableDetail = NonNullable<
  Awaited<ReturnType<typeof getStoredExternalLabOrderableAction>>["data"]
>;
