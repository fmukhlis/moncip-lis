import { auth } from "@/auth";
import { getLabMembers } from "@/features/lab/dal/query";
import { labMemberColumns } from "./columns";
import { DataTableForCard } from "../data-table";

export default async function LabMemberTable() {
  const session = await auth();

  if (!session?.user?.laboratoryId) {
    return (
      <div>{`Error: user is currently haven't joined to any laboratory.`}</div>
    );
  }

  const users = await getLabMembers(session.user.laboratoryId);

  return <DataTableForCard columns={labMemberColumns} data={users} />;
}
