import { Card, CardHeader } from "@/components/ui/card";

export default function Header() {
  return (
    <Card>
      <CardHeader className="gap-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight leading-none">
              Organization
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage users, roles, and departments for your organization.
            </p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
