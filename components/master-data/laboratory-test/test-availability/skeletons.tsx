import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Checkbox } from "@/components/ui/checkbox";
import { DynamicSkeleton } from "@/components/ui/dynamic-skeleton";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ListCollapse, Search, X } from "lucide-react";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";

export function AvailableTestCardSkeleton() {
  return (
    <div className="basis-[450px] flex-2 min-w-0">
      <Card>
        <CardHeader>
          <CardTitle>Availabile Tests</CardTitle>
          <CardDescription>
            Browse and select tests from the global catalog to add to your
            laboratory.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5">
          <AvailableTestListSkeleton />
        </CardContent>
      </Card>
    </div>
  );
}

function AvailableTestListHeaderSkeleton() {
  return (
    <div className="grid sm:grid-cols-[minmax(0,2fr)_1fr] gap-3 mb-4">
      <InputGroup>
        <InputGroupInput disabled placeholder="Search by name..." />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            title="Clear filter"
            aria-label="Clear filter"
          >
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <div className="flex flex-1 gap-3 justify-center items-center sm:justify-end">
        <div className="flex">
          <Checkbox disabled className="size-9 rounded-md" />
        </div>
        <div>
          <Toggle
            size={"default"}
            disabled
            className="border"
            aria-label="Toggle show selected"
          >
            <ChevronDown />
          </Toggle>
        </div>
      </div>
    </div>
  );
}

function AvailableTestListSkeleton() {
  return (
    <>
      <AvailableTestListHeaderSkeleton />
      <ul className="grid grid-cols-1">
        {Array.from({ length: 7 }).map((_, index) => (
          <Collapsible key={index} className="flex flex-col">
            <li className="flex-1 flex items-center h-11 border-b py-2 gap-3 sticky top-(--header-height) z-10 bg-card">
              <ListCollapse
                size={17}
                className="shrink-0 mr-1 text-muted-foreground"
              />
              <div className="truncate flex-1">
                <DynamicSkeleton className="h-3" />
              </div>
              <div className="flex m-1">
                <Checkbox disabled className="size-7 rounded-md" />
              </div>
              <div className="m-0.5">
                <CollapsibleTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled
                    className="size-8"
                  >
                    <ChevronDown />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </li>
          </Collapsible>
        ))}
      </ul>
    </>
  );
}
