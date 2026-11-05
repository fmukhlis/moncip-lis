"use client";

import Barcode from "react-barcode";
import { format } from "date-fns";
import { Fragment, JSX, useCallback, useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { SpecimenStatus } from "@/generated/prisma";
import type { LabOrderDetail } from "@/features/lab-order/lab-order.type";

/**
 * The printable labels of an order: one label per active specimen, carrying the
 * patient demographics, the specimen barcode and the current timestamp.
 * Cancelled and rejected specimens are left out, because their label must never
 * be attached to a sample.
 */
export function buildLabOrderLabelContent(order: LabOrderDetail) {
  return (
    <>
      {order.specimens
        .filter(
          ({ status }) =>
            status !== SpecimenStatus.CANCELLED &&
            status !== SpecimenStatus.REJECTED,
        )
        .map(({ id, no, specimenType }) => (
          <Fragment key={id}>
            <div className="flex flex-col break-after-page p-1">
              <div className="flex gap-1 text-[10px]">
                <span className="whitespace-nowrap">
                  MRN : <span className="">{order.patient.mrn}</span>
                </span>
                <span className="">|</span>
                <span className="whitespace-nowrap">
                  DoB :{" "}
                  <span className="">
                    {order.patient.dateOfBirth
                      ? format(order.patient.dateOfBirth, "dd-MMM-yyyy")
                      : "—"}
                  </span>
                </span>
              </div>
              <span className="font-semibold text-xs">
                {order.patient.name}
              </span>
              <Barcode
                value={no}
                height={20}
                fontSize={7}
                marginTop={3}
                marginLeft={3}
                marginRight={3}
                marginBottom={3}
                className="w-full shrink-0"
              />
              <div className="text-[10px] line-clamp-1 flex gap-1">
                <span className="shrink-0">{specimenType.displayName}</span>
                <span className="shrink-0">|</span>
                <span className="truncate">
                  {format(new Date(), "dd/MM/yyyy HH:mm")}
                </span>
              </div>
            </div>
          </Fragment>
        ))}
    </>
  );
}

/**
 * Printing a lab order label.
 *
 * The print target has to be in the DOM before `react-to-print` runs, so the hook
 * renders the labels into a container that is only visible when printing and
 * prints from an effect, once the content is committed. `printLabel` therefore
 * only fills that container; the effect is what opens the print dialog.
 *
 * The order detail header and the specimen assignment worklist both print from
 * here, so the label markup exists in exactly one place.
 */
export function usePrintLabOrderLabel() {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({});

  const [isMounted, setIsMounted] = useState(false);
  const [printContent, setPrintContent] = useState<JSX.Element | null>(null);

  const reactToPrintContent = () => {
    return contentRef.current;
  };

  const printLabel = useCallback((order: LabOrderDetail) => {
    setPrintContent(buildLabOrderLabelContent(order));
  }, []);

  useEffect(() => {
    setIsMounted(true);
    if (isMounted && reactToPrintContent()?.hasChildNodes()) {
      reactToPrintFn(reactToPrintContent);
    }
  }, [printContent, isMounted, reactToPrintFn]);

  /** Render this inside the caller's tree; it is hidden unless printing. */
  const printPortal = (
    <div className="hidden print:block">
      <div ref={contentRef} className="w-[50mm] h-[25mm]">
        {printContent}
      </div>
    </div>
  );

  return { printLabel, printPortal };
}
