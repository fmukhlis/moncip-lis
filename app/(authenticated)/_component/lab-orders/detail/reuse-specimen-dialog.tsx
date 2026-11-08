"use client";

import ReuseSpecimenDialog from "../reuse-specimen-dialog";
import { useLabOrderDetailContext } from "./context";
import { setIsReuseSpecimenDialogOpen } from "./slice";
import { useAppDispatch, useAppSelector } from "@/hooks";

/**
 * Binds the shared assign existing specimen dialog to the lab order detail
 * state: the open flag lives in the detail slice and the trigger element in the
 * detail context. All the fetching and assigning logic stays in the shared
 * dialog.
 */
export default function LabOrderDetailReuseSpecimenDialog({
  labOrderId,
}: {
  labOrderId: string;
}) {
  // Global state
  const isOpen = useAppSelector(
    (state) => state.labOrderDetail.isReuseSpecimenDialogOpen,
  );
  const dispatch = useAppDispatch();
  const { reuseSpecimenDialogTrigger } = useLabOrderDetailContext();

  return (
    <ReuseSpecimenDialog
      labOrderId={labOrderId}
      isOpen={isOpen}
      triggerElement={reuseSpecimenDialogTrigger}
      onOpenChange={(open) => {
        dispatch(setIsReuseSpecimenDialogOpen(open));
      }}
    />
  );
}
