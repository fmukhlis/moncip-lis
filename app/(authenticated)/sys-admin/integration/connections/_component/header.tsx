import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

export default function ConnectionSettingsHeader() {
  return (
    <Card>
      <CardHeader className="gap-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight leading-none">
              Connection Settings
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage HIS integration connections, tokens, and catalog
              synchronization.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/sys-admin/integration/connections/new">
                <Plus />
                New Connection
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
