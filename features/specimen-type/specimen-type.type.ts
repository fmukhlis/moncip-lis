import {
  getSpecimenTypeAction,
  getSpecimenTypesAction,
} from "./specimen-type.action";

export type SpecimenType = Awaited<
  ReturnType<typeof getSpecimenTypesAction>
>["data"][number];

export type SpecimenTypeDetail = NonNullable<
  Awaited<ReturnType<typeof getSpecimenTypeAction>>["data"]
>;
