import { auth } from "@/auth";
import { getLabMembers } from "@/features/lab/dal/query";
import { DataTableForCard } from "@/components/user/data-table";
import { labMemberColumns } from "@/components/user/columns";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export default async function LabMember() {
  const session = await auth();

  if (!session?.user?.laboratoryId) {
    return (
      <div>{`Error: user is currently haven't joined to any laboratory.`}</div>
    );
  }

  const users = await getLabMembers(session.user.laboratoryId);

  await new Promise((r) => {
    setTimeout(r, 3000);
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Create, update, and remove user accounts. Control roles and manage
          system access for all team members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTableForCard columns={labMemberColumns} data={users} />
      </CardContent>
    </Card>
  );
}
