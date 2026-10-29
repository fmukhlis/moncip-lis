"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SpecimenStatus } from "@/generated/prisma";
import {
  PackageCheck,
  FilePenLine,
  MoreHorizontal,
  ClipboardCheck,
  ClipboardClock,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { useLabOrderDetailContext } from "../context";
import {
  setSelectedSpecimenId,
  setIsCancelSpecimenDialogOpen,
  setIsCollectSpecimenDialogOpen,
  setIsReassignSpecimenDialogOpen,
  setIsReceiveSpecimenDialogOpen,
} from "../slice";
import {
  SpecimenMenuAction,
  SpecimenStandaloneAction,
  getSpecimenMenuActions,
  getSpecimenStandaloneAction,
} from "./specimen-menu-action";

const menuActionLabels: Record<SpecimenMenuAction, string> = {
  reassign: "Reassign Specimen",
  updateCollectionRecord: "Update Collection Record",
  updateReceiptRecord: "Update Receipt Record",
  cancel: "Cancel Specimen",
};

const menuActionIcons = {
  reassign: SquarePen,
  updateCollectionRecord: ClipboardCheck,
  updateReceiptRecord: FilePenLine,
  cancel: Trash2,
} satisfies Record<SpecimenMenuAction, typeof SquarePen>;

const standaloneActionLabels: Record<SpecimenStandaloneAction, string> = {
  logCollection: "Log Collection",
  receive: "Receive Specimen",
};

const standaloneActionIcons = {
  logCollection: ClipboardClock,
  receive: PackageCheck,
} satisfies Record<SpecimenStandaloneAction, typeof SquarePen>;

export default function SpecimenActions({
  specimen,
}: {
  specimen: {
    id: string;
    status: SpecimenStatus;
    specimenType: { displayName: string };
  };
}) {
  // Global state
  const dispatch = useAppDispatch();

  const {
    setReassignSpecimenDialogTrigger,
    setCancelSpecimenDialogTrigger,
    setCollectSpecimenDialogTrigger,
    setReceiveSpecimenDialogTrigger,
  } = useLabOrderDetailContext();

  // The menu trigger doubles as the element focus returns to once a dialog
  // opened from the menu is closed.
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  const { id, status, specimenType } = specimen;

  const menuActions = getSpecimenMenuActions(status);
  const standaloneAction = getSpecimenStandaloneAction(status);
  const primaryMenuActions = menuActions.filter(
    (action) => action !== "cancel",
  );
  const canBeCancelled = menuActions.includes("cancel");

  const openCollectionDialog = (trigger: HTMLButtonElement) => {
    dispatch(setSelectedSpecimenId(id));
    dispatch(setIsCollectSpecimenDialogOpen(true));
    setCollectSpecimenDialogTrigger(trigger);
  };

  const openMenuActionDialog = (action: SpecimenMenuAction) => {
    dispatch(setSelectedSpecimenId(id));

    switch (action) {
      case "reassign":
        dispatch(setIsReassignSpecimenDialogOpen(true));
        if (menuTriggerRef.current) {
          setReassignSpecimenDialogTrigger(menuTriggerRef.current);
        }
        break;
      case "updateCollectionRecord":
        if (menuTriggerRef.current) {
          openCollectionDialog(menuTriggerRef.current);
        }
        break;
      case "updateReceiptRecord":
        dispatch(setIsReceiveSpecimenDialogOpen(true));
        if (menuTriggerRef.current) {
          setReceiveSpecimenDialogTrigger(menuTriggerRef.current);
        }
        break;
      case "cancel":
        dispatch(setIsCancelSpecimenDialogOpen(true));
        if (menuTriggerRef.current) {
          setCancelSpecimenDialogTrigger(menuTriggerRef.current);
        }
        break;
    }
  };

  const openStandaloneActionDialog = (
    action: SpecimenStandaloneAction,
    trigger: HTMLButtonElement,
  ) => {
    if (action === "logCollection") {
      openCollectionDialog(trigger);
      return;
    }

    dispatch(setSelectedSpecimenId(id));
    dispatch(setIsReceiveSpecimenDialogOpen(true));
    setReceiveSpecimenDialogTrigger(trigger);
  };

  if (!menuActions.length && !standaloneAction) {
    return null;
  }

  const StandaloneIcon = standaloneAction
    ? standaloneActionIcons[standaloneAction]
    : null;

  return (
    <div className="ml-auto flex items-center gap-1">
      {standaloneAction && StandaloneIcon && (
        <Button
          size={"sm"}
          variant={"outline"}
          className="h-6 gap-1 px-2 text-xs"
          onClick={(e) => {
            openStandaloneActionDialog(standaloneAction, e.currentTarget);
          }}
        >
          <StandaloneIcon className="size-3.5" />
          {standaloneActionLabels[standaloneAction]}
          <span className="sr-only"> for {specimenType.displayName}</span>
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={menuTriggerRef}
            size={"icon-sm"}
            variant="ghost"
            className="size-6"
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">
              Specimen actions for {specimenType.displayName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {primaryMenuActions.map((action) => {
            const Icon = menuActionIcons[action];

            return (
              <DropdownMenuItem
                key={action}
                onSelect={() => openMenuActionDialog(action)}
              >
                <Icon />
                {menuActionLabels[action]}
              </DropdownMenuItem>
            );
          })}
          {canBeCancelled && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => openMenuActionDialog("cancel")}
              >
                <Trash2 />
                {menuActionLabels.cancel}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
