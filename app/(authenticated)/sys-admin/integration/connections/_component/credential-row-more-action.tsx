"use client";

import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks";
import { getCredentialStatus } from "../_lib/get-credential-status";
import { IntegrationCredential } from "@/features/integration-credential/integration-credential.type";
import {
  setIsRevokeCredentialDialogOpen,
  setIsRotateCredentialDialogOpen,
  setSelectedIntegrationCredentialId,
} from "../slice";
import {
  Undo2,
  RefreshCcw,
  TriangleAlert,
  MoreHorizontalIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function CredentialRowMoreAction({
  integrationCredential,
}: {
  integrationCredential: IntegrationCredential;
}) {
  const dispatch = useAppDispatch();

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          dispatch(
            setSelectedIntegrationCredentialId(integrationCredential.id),
          );
        }
      }}
    >
      <DropdownMenuTrigger
        asChild
        disabled={
          getCredentialStatus({
            expiresAt: integrationCredential.expiresAt,
            revokedAt: integrationCredential.revokedAt,
          }) !== "ACTIVE"
        }
      >
        <Button variant="outline" size="icon-sm" className="h-5">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-36" side="left" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem className={`w-full gap-2`} asChild>
            <button
              onClick={() => {
                dispatch(setIsRotateCredentialDialogOpen(true));
              }}
            >
              <RefreshCcw />
              Rotate
              <TriangleAlert className="ml-auto fill-warning/10 text-warning stroke-warning" />
            </button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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
