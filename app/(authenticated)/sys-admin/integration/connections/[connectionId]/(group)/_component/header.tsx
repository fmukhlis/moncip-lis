import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";

export default function IntegrationConnectionDetailHeader() {
  return (
    <Card>
      <CardHeader className="gap-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight leading-none">
              Connection Detail
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage integration settings, authentication tokens, external
              mappings, and incoming events for this connection.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant={"outline"}>
              <Link href="/sys-admin/integration/connections">
                <ArrowLeft />
                Back to Conn. Settings
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
