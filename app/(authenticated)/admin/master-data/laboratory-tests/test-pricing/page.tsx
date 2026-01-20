import React from "react";
import TestPricingTable from "@/components/master-data/laboratory-test/test-pricing/test/test-pricing-table";
import TestGroupPricingTable from "@/components/master-data/laboratory-test/test-pricing/panel/test-group-pricing-table";
import ArchiveLocalTestGroupDialog from "@/components/master-data/laboratory-test/test-pricing/panel/archive-local-test-group-dialog";
import MarkLocalTestOrderableDialog from "@/components/master-data/laboratory-test/test-pricing/test/mark-local-test-orderable-dialog";
import UnarchiveLocalTestGroupDialog from "@/components/master-data/laboratory-test/test-pricing/panel/unarchive-local-test-group-dialog";
import ConfigureLocalTestPricingDialog from "@/components/master-data/laboratory-test/test-pricing/test/configure-local-test-pricing-dialog";
import MarkLocalTestNotOrderableDialog from "@/components/master-data/laboratory-test/test-pricing/test/mark-local-test-not-orderable-dialog";
import MarkLocalTestGroupOrderableDialog from "@/components/master-data/laboratory-test/test-pricing/panel/mark-local-test-group-orderable-dialog";
import ConfigureLocalTestGroupPricingDialog from "@/components/master-data/laboratory-test/test-pricing/panel/configure-local-test-group-pricing-dialog";
import MarkLocalTestGroupNotOrderableDialog from "@/components/master-data/laboratory-test/test-pricing/panel/mark-local-test-group-not-orderable-dialog";

import { Separator } from "@/components/ui/separator";
import { testPricingColumns } from "@/components/master-data/laboratory-test/test-pricing/test/columns";
import { testGroupPricingColumns } from "@/components/master-data/laboratory-test/test-pricing/panel/columns";

export default function TestPricing() {
  return (
    <div className="flex flex-1 flex-col gap-7 p-4">
      <div>
        <div className="flex flex-col gap-4">
          <div className="px-3 py-1">
            <h1 className="text-2xl font-semibold mb-2">Test Pricing</h1>
            <div className="">
              Manage pricing for laboratory tests across different tariff
              groups.
            </div>
          </div>
          <Separator />
          <TestPricingTable columns={testPricingColumns} />
        </div>
        <MarkLocalTestOrderableDialog />
        <MarkLocalTestNotOrderableDialog />
        <ConfigureLocalTestPricingDialog />
      </div>

      <div>
        <div className="flex flex-col gap-4">
          <div className="px-3 py-1">
            <h1 className="text-2xl font-semibold mb-2">Panel Pricing</h1>
            <div className="">
              Manage pricing for test panels across different tariff groups.
            </div>
          </div>
          <Separator />
          <TestGroupPricingTable columns={testGroupPricingColumns} />
        </div>
        <ArchiveLocalTestGroupDialog />
        <UnarchiveLocalTestGroupDialog />
        <MarkLocalTestGroupOrderableDialog />
        <MarkLocalTestGroupNotOrderableDialog />
        <ConfigureLocalTestGroupPricingDialog />
      </div>
    </div>
  );
}
