import prisma from "@/lib/prisma";

export async function getUserCredentials(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });

  return user?.username && user.password
    ? {
        id: user.id,
        username: user.username,
        password: user.password,
      }
    : null;
}
