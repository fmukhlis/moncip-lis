import SelectedTestsCard from "@/components/master-data/laboratory-test/test-availability/selected-test/selected-tests-card";
import AvailableTestCard from "@/components/master-data/laboratory-test/test-availability/available-test/available-test-card";

import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { AvailableTestCardSkeleton } from "@/components/master-data/laboratory-test/test-availability/skeletons";

export default function TestAvailability() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="px-3 py-1">
        <h1 className="text-2xl font-semibold mb-2">Test Availability</h1>
        <div className="">
          Manage which laboratory tests are available in your lab from the
          global catalog.
        </div>
      </div>
      <Separator />
      <div className="grid auto-rows-min gap-4">
        <div className="flex flex-wrap gap-4">
          <Suspense
            key={`${Math.random()}`}
            fallback={<AvailableTestCardSkeleton />}
          >
            <AvailableTestCard />
          </Suspense>
          <SelectedTestsCard />
        </div>
      </div>
    </div>
  );
}
