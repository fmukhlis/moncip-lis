import prisma from "@/lib/prisma";

import { $Enums } from "@/generated/prisma";

export async function getLabMembers(laboratoryId: string) {
  const users = await prisma.user.findMany({
    where: {
      role: {
        not: "admin",
      },
      laboratoryId,
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    role: user.role as Exclude<$Enums.Role, "admin">,
    username: user.username,
  }));
}

export async function createLaboratory(userId: string) {
  return await prisma.laboratory.create({
    data: { users: { connect: { id: userId } } },
  });
}
