import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft, SearchX } from "lucide-react";
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyHeader,
  EmptyContent,
  EmptyDescription,
} from "@/components/ui/empty";

export default function ConnectionNotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="shadow">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle className="text-base font-semibold">
          Connection not found
        </EmptyTitle>
        <EmptyDescription>
          The connection you are looking for does not exist or the ID may be
          incorrect.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button variant="outline" asChild>
          <Link
            href="/sys-admin/integration/connections"
            className="flex items-center"
          >
            <MoveLeft className="size-3.5" />
            Go back
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
