import LabMemberTable from "@/components/user/lab-member-table";
import CreateUserForm from "@/components/user/create-user-form";

import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboard() {
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
            <LabMemberTable />
          </CardContent>
          <CardFooter className="flex gap-3">
            <CreateUserForm />
            <Button variant={"secondary"} className="w-[90px] ml-auto">
              <ArrowBigLeft />
              Prev
            </Button>
            <Button variant={"secondary"} className="w-[90px] -auto">
              Next
              <ArrowBigRight />
            </Button>
          </CardFooter>
        </Card>
      </main>
    </SessionProvider>
  );
}
