"use client";

import { useEffect, useRef, useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetLabOrderActionQuery } from "@/features/lab-order/lab-order.api";
import { usePrintLabOrderLabel } from "../detail/use-print-lab-order-label";

/**
 * Prints the labels of a fully assigned order from the worklist.
 *
 * The worklist renders the shared order list projection, which does not carry
 * everything a label needs (patient date of birth, specimen numbers), so the
 * printer is mounted on the first click and loads the order detail then. Cards
 * nobody prints therefore fetch nothing extra.
 */
export default function PrintLabelButton({
  labOrderId,
}: {
  labOrderId: string;
}) {
  // Every click mounts a fresh printer: the same order can be printed twice and
  // a click after a failed load retries instead of being remembered as a no-op.
  const [printRequestCount, setPrintRequestCount] = useState(0);

  return (
    <>
      <Button
        size="sm"
        className="w-full sm:w-auto"
        onClick={() => setPrintRequestCount((count) => count + 1)}
      >
        <Printer />
        Print Label
        <span className="sr-only"> for this lab order</span>
      </Button>
      {printRequestCount > 0 && (
        <LabOrderLabelPrinter key={printRequestCount} labOrderId={labOrderId} />
      )}
    </>
  );
}

function LabOrderLabelPrinter({ labOrderId }: { labOrderId: string }) {
  // Server state: the detail projection is what the labels are built from.
  const { data } = useGetLabOrderActionQuery({ id: labOrderId });
  const { printLabel, printPortal } = usePrintLabOrderLabel();

  const order = data?.data;
  const hasPrintedRef = useRef(false);

  useEffect(() => {
    if (!order || hasPrintedRef.current) {
      return;
    }

    hasPrintedRef.current = true;
    printLabel(order);
  }, [order, printLabel]);

  return printPortal;
}
