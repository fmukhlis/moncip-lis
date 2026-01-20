import React from "react";

import { CircleSmall } from "lucide-react";
import { LocalTestGroup } from "@/features/master-data/type/test-pricing";
import {
  Item,
  ItemTitle,
  ItemContent,
  ItemDescription,
} from "@/components/ui/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TestListProps = { localTestGroup: LocalTestGroup | undefined };

export default function TestList({ localTestGroup }: TestListProps) {
  return (
    <ul className="flex flex-wrap gap-1 items-center">
      {localTestGroup?.laboratoriesOnLabTests.map(
        ({
          id,
          labTest: { name, category },
          deletedAt,
          notOrderableReason,
        }) => {
          return (
            <li key={id} className="min-w-[320px]">
              <Item variant={"outline"}>
                <ItemContent>
                  <ItemTitle>{name}</ItemTitle>
                  <ItemDescription>Category : {category.name}</ItemDescription>
                </ItemContent>
                <ItemContent>
                  <ItemTitle>Status</ItemTitle>
                  <ItemDescription className="flex justify-center">
                    <Tooltip delayDuration={500}>
                      <TooltipTrigger asChild>
                        <CircleSmall
                          size={20}
                          className={`${deletedAt || notOrderableReason ? "text-red-600 fill-rose-600" : "text-green-600 fill-emerald-600"}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex flex-col gap-0.5 items-center p-0.5">
                          <span className="font-bold">
                            {deletedAt ? "Inactive" : "Active"}
                          </span>
                          <span>
                            {notOrderableReason ? "Not Orderable" : "Orderable"}
                          </span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </ItemDescription>
                </ItemContent>
              </Item>
            </li>
          );
        },
      )}
    </ul>
  );
}
