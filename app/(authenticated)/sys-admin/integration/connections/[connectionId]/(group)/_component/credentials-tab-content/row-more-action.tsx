"use client";

import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks";
import { getCredentialStatus } from "../../../../_lib/get-credential-status";
import { IntegrationConnectionDetail } from "@/features/integration-connection/integration-connection.type";
import { MoreVertical, RefreshCcw, TriangleAlert, Undo2 } from "lucide-react";
import {
  setIsRevokeCredentialDialogOpen,
  setIsRotateCredentialDialogOpen,
  setSelectedIntegrationCredentialId,
} from "../../slice";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RowMoreAction({
  credential,
}: {
  credential: IntegrationConnectionDetail["credentials"][number];
}) {
  const dispatch = useAppDispatch();

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          dispatch(setSelectedIntegrationCredentialId(credential.id));
        }
      }}
    >
      <DropdownMenuTrigger
        asChild
        disabled={
          getCredentialStatus({
            expiresAt: credential.expiresAt,
            revokedAt: credential.revokedAt,
          }) !== "ACTIVE"
        }
      >
        <Button variant="ghost" size="icon-sm" className="h-5">
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-40" side="left" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem className={`w-full gap-2`} asChild>
            <button
              onClick={() => {
                dispatch(setIsRotateCredentialDialogOpen(true));
              }}
            >
              <RefreshCcw />
              Rotate
              <TriangleAlert className="ml-auto fill-orange-100 text-orange-500 stroke-orange-500 dark:fill-orange-400/10 dark:text-orange-400 dark:stroke-orange-400" />
            </button>
          </DropdownMenuItem>
          <DropdownMenuItem
            variant={"destructive"}
            className={`w-full gap-2`}
            asChild
          >
            <button
              onClick={() => {
                dispatch(setIsRevokeCredentialDialogOpen(true));
              }}
            >
              <Undo2 />
              Revoke
            </button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
