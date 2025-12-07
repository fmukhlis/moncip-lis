import React from "react";
import ReferenceRangesTableWrapper from "@/components/master-data/laboratory-test/reference-ranges/reference-ranges-table-wrapper";
import ReferenceRangesTableSkeleton from "@/components/master-data/laboratory-test/reference-ranges/skeletons";

import { Separator } from "@/components/ui/separator";

export default function ReferenceRanges() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="px-3 py-1">
        <h1 className="text-2xl font-semibold mb-2">Reference Ranges</h1>
        <div className="">
          Manage the reference ranges used to interpret laboratory test results
          by age, sex, and units.
        </div>
      </div>
      <Separator />
      <React.Suspense fallback={<ReferenceRangesTableSkeleton />}>
        <ReferenceRangesTableWrapper />
      </React.Suspense>
    </div>
  );
}
