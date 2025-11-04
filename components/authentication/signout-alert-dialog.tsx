"use client";

import React from "react";
import SignoutButton from "./signout-button";

import { resetApp } from "@/root-reducer";
import { signOutAction } from "@/features/authentication/action";
import { setShowSignoutDialog } from "@/features/authentication/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from "../ui/alert-dialog";

export default function SignoutAlertDialog() {
  const showSignoutDialog = useAppSelector(
    (state) => state.authentication.showSignoutDialog,
  );

  const dispatch = useAppDispatch();

  return (
    <AlertDialog
      open={showSignoutDialog}
      onOpenChange={(isOpen) => {
        dispatch(setShowSignoutDialog(isOpen));
      }}
    >
      <form id="signout-form" action={signOutAction}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              If you logged in using{" "}
              <span className="text-primary">Google</span> or{" "}
              <span className="text-primary">GitHub</span>, signing out here{" "}
              <span className="text-primary">only</span> ends your Moncip LIS
              session. To <span className="text-primary">fully</span> protect
              your account, please also{" "}
              <span className="text-primary">sign out</span> of your{" "}
              <span className="text-primary">Google</span> or{" "}
              <span className="text-primary">GitHub</span> account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <SignoutButton
              type="submit"
              form="signout-form"
              onClick={() => {
                dispatch(resetApp());
              }}
              className="sm:w-[100px]"
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  );
}
