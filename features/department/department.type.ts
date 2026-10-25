import { getDepartmentAction, getDepartmentsAction } from "./department.action";

export type Department = Awaited<
  ReturnType<typeof getDepartmentsAction>
>["data"][number];

export type DepartmentDetail = NonNullable<
  Awaited<ReturnType<typeof getDepartmentAction>>
>["data"];
