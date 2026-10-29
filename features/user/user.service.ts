"use server";

import prisma from "@/lib/prisma";
import saltAndHash from "@/lib/salt-and-hash";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import {
  userDetailSelect,
  userListSelect,
  userOptionSelect,
} from "./user.select";
import {
  isPaginated,
  buildPrismaPage,
  resolvePagination,
  buildPaginationMeta,
} from "@/lib/pagination";
import {
  GetUserSchema,
  GetUsersSchema,
  CreateUserSchema,
  DeleteUserSchema,
  UpdateUserSchema,
  GetSpecimenPersonnelCandidatesSchema,
} from "./user.schema";

type DatabaseClient = typeof prisma;

export async function createUser(
  db: Pick<DatabaseClient, "user">,
  {
    name,
    role,
    username,
    password,
    departmentId,
    laboratoryId,
  }: z.infer<typeof CreateUserSchema>,
) {
  return db.user.create({
    data: {
      name,
      role,
      username,
      password: await saltAndHash(password),
      laboratory: { connect: { id: laboratoryId } },
      ...(departmentId && { department: { connect: { id: departmentId } } }),
    },
    select: userListSelect,
  });
}

export async function getUsers(
  db: Pick<DatabaseClient, "user">,
  {
    page,
    role,
    search,
    pageSize,
    departmentId,
    laboratoryId,
  }: z.infer<typeof GetUsersSchema>,
) {
  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : { role: { not: "SYS_ADMIN" } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(departmentId && { departmentId }),
    laboratoryId,
  };

  let resolvedPagination: ReturnType<typeof resolvePagination> | null = null;

  if (isPaginated({ page, pageSize })) {
    resolvedPagination = resolvePagination({ page, pageSize });
  }

  const users = await db.user.findMany({
    where,
    select: userListSelect,
    orderBy: { name: "asc" },
    ...(resolvedPagination
      ? buildPrismaPage(resolvedPagination.page, resolvedPagination.pageSize)
      : undefined),
  });

  let paginationMeta: ReturnType<typeof buildPaginationMeta> | null = null;

  if (resolvedPagination) {
    const count = await db.user.count({ where });

    paginationMeta = buildPaginationMeta(
      count,
      resolvedPagination.page,
      resolvedPagination.pageSize,
    );
  }

  return [users, paginationMeta] as const;
}

export async function getUser(
  db: Pick<DatabaseClient, "user">,
  { id, laboratoryId }: z.infer<typeof GetUserSchema>,
) {
  return db.user.findFirst({
    where: { id, laboratoryId },
    select: userDetailSelect,
  });
}

/**
 * The users that can appear on a specimen record, either as the collector or as
 * the receiver.
 */
export async function getSpecimenPersonnelCandidates(
  db: Pick<DatabaseClient, "user">,
  { laboratoryId }: z.infer<typeof GetSpecimenPersonnelCandidatesSchema>,
) {
  return db.user.findMany({
    where: { laboratoryId, role: { not: "SYS_ADMIN" } },
    select: userOptionSelect,
    orderBy: { name: "asc" },
  });
}

export async function getSpecimenPersonnelCandidate(
  db: Pick<DatabaseClient, "user">,
  { id, laboratoryId }: z.infer<typeof GetUserSchema>,
) {
  return db.user.findFirst({
    where: { id, laboratoryId, role: { not: "SYS_ADMIN" } },
    select: userOptionSelect,
  });
}

export async function updateUser(
  db: Pick<DatabaseClient, "user">,
  {
    id,
    name,
    role,
    username,
    password,
    departmentId,
    laboratoryId,
  }: z.infer<typeof UpdateUserSchema>,
) {
  return db.user.update({
    where: { id, laboratoryId },
    data: {
      role,
      name,
      username,
      password: password ? await saltAndHash(password) : undefined,
      ...(departmentId && { department: { connect: { id: departmentId } } }),
    },
    select: userListSelect,
  });
}

export async function deleteUser(
  db: Pick<DatabaseClient, "user">,
  { id, laboratoryId }: z.infer<typeof DeleteUserSchema>,
) {
  return db.user.delete({
    where: { id, laboratoryId },
    select: userListSelect,
  });
}
