import CreateUserForm from "@/components/user/create-user-form";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { getLabMembers } from "@/features/lab/dal/query";
import { SessionProvider } from "next-auth/react";
import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Users",
};

export default async function AdminDashboard() {
  const session = await auth();

  const users = await getLabMembers(session?.user?.laboratoryId ?? "");

  return (
    <SessionProvider>
      <main>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Create, update, and remove user accounts. Control roles and manage
              system access for all team members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul>
              {users.map((user) => (
                <li key={user.id} className="text-sm">
                  {user.name}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant={"destructive"} className="mr-auto font-semibold">
              Delete
            </Button>
            <CreateUserForm />
          </CardFooter>
        </Card>
      </main>
    </SessionProvider>
  );
}
