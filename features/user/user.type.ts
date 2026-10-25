import { getUserAction, getUsersAction } from "./user.action";

export type User = Awaited<ReturnType<typeof getUsersAction>>["data"][number];

export type UserDetail = NonNullable<
  Awaited<ReturnType<typeof getUserAction>>["data"]
>;
