import { getUnitAction, getUnitsAction } from "./unit.action";

export type Unit = Awaited<ReturnType<typeof getUnitsAction>>["data"][number];

export type UnitDetail = NonNullable<
  Awaited<ReturnType<typeof getUnitAction>>["data"]
>;
