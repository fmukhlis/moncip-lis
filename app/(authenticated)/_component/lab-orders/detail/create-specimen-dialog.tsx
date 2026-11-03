"use client";

import CreateSpecimenDialog from "../create-specimen-dialog";
import { useLabOrderDetailContext } from "./context";
import { setIsCreateSpecimenDialogOpen } from "./slice";
import { useAppDispatch, useAppSelector } from "@/hooks";

/**
 * Binds the shared create specimen dialog to the lab order detail state: the open
 * flag lives in the detail slice and the trigger element in the detail context.
 * All the fetching and creation logic stays in the shared dialog.
 */
export default function LabOrderDetailCreateSpecimenDialog({
  labOrderId,
}: {
  labOrderId: string;
}) {
  // Global state
  const isOpen = useAppSelector(
    (state) => state.labOrderDetail.isCreateSpecimenDialogOpen,
  );
  const dispatch = useAppDispatch();
  const { createSpecimenDialogTrigger } = useLabOrderDetailContext();

  return (
    <CreateSpecimenDialog
      labOrderId={labOrderId}
      isOpen={isOpen}
      triggerElement={createSpecimenDialogTrigger}
      onOpenChange={(open) => {
        dispatch(setIsCreateSpecimenDialogOpen(open));
      }}
    />
  );
}
