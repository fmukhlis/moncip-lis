"use client";

import { Button } from "@/components/ui/button";
import { TestTube2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { unselectMainTableRow } from "@/features/master-data/test-availability-slice";
import {
  Item,
  ItemMedia,
  ItemTitle,
  ItemActions,
  ItemContent,
} from "@/components/ui/item";

export default function SelectedTestList() {
  const selectedMasterLabTests = useAppSelector(
    (state) => state.testAvailability.selectedMasterLabTests,
  );

  const dispatch = useAppDispatch();

  return (
    <div className="grid grid-cols-1 gap-1 flex-1">
      {selectedMasterLabTests.length ? (
        selectedMasterLabTests.map((test) => (
          <Item
            key={test.id}
            size="sm"
            variant="outline"
            className="group items-center gap-1 flex-nowrap animate-fade-in origin-top"
          >
            <ItemMedia variant={"icon"}>
              <TestTube2 className="group-has-[[aria-checked=true]]:max-w-0 max-w-4 duration-500" />
            </ItemMedia>
            <ItemContent className="min-w-0">
              <ItemTitle>
                <span className="truncate h-[18px] group-has-[[aria-checked=true]]:ml-0 duration-500 mx-1.5">
                  {test.name}
                </span>
              </ItemTitle>
            </ItemContent>
            <ItemActions>
              <Button
                variant={"ghost"}
                size={"icon-sm"}
                className="bg-destructive/10 ml-auto"
                onClick={() => {
                  dispatch(unselectMainTableRow([test.id]));
                }}
              >
                <X className="size-4 text-destructive" />
              </Button>
            </ItemActions>
          </Item>
        ))
      ) : (
        <Item variant="outline" size="sm" className="flex-nowrap">
          <ItemContent className="min-w-0">
            <ItemTitle>
              <span className="mx-auto text-muted-foreground truncate max-w-[225px]">
                There is no test selected yet.
              </span>
            </ItemTitle>
          </ItemContent>
        </Item>
      )}
    </div>
  );
}
