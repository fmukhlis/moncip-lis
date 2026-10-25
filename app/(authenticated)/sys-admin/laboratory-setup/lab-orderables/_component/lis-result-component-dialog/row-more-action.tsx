"use client";

import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks";
import { LisPerformableDetail } from "@/features/lis-performable/lis-performable.type";
import { CircleCheckBig, CircleOff, MoreVertical, Pen } from "lucide-react";
import {
  setSelectedLisResultComponentId,
  setIsEditResultComponentDialogOpen,
  setResultComponentStatusDialogMode,
  setIsResultComponentStatusDialogOpen,
} from "../../slice";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function RowMoreAction({
  resultComponent,
}: {
  resultComponent: LisPerformableDetail["resultComponents"][number];
}) {
  const dispatch = useAppDispatch();

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          dispatch(setSelectedLisResultComponentId(resultComponent.id));
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-40" side="left" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <button
              className="w-full gap-2"
              onClick={() => {
                dispatch(setIsEditResultComponentDialogOpen(true));
              }}
            >
              <Pen /> Edit Component
            </button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant={resultComponent.isActive ? "destructive" : "default"}
            className={`${resultComponent.isActive ? "" : "text-success focus:**:!text-success focus:text-success focus:bg-success/10"} w-full gap-2`}
            asChild
          >
            <button
              onClick={() => {
                dispatch(
                  setResultComponentStatusDialogMode(
                    !resultComponent.isActive ? "Activate" : "Deactivate",
                  ),
                );
                dispatch(setIsResultComponentStatusDialogOpen(true));
              }}
            >
              {resultComponent.isActive ? (
                <>
                  <CircleOff />
                  Deactivate
                </>
              ) : (
                <>
                  <CircleCheckBig />
                  Activate
                </>
              )}
            </button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
