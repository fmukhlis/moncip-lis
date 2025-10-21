import prisma from "@/lib/prisma";

export default async function getLabMembers(laboratoryId: string) {
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
    role: user.role,
    username: user.username,
  }));
}

export async function getUserCredentials(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });

  return user?.username && user.password
    ? {
        username: user.username,
        password: user.password,
      }
    : null;
}
