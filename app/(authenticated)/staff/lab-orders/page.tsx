import { Metadata } from "next";
import LabOrdersHeading from "@/app/(authenticated)/_component/lab-orders/lab-orders-heading";
import TableWrapper from "@/app/(authenticated)/_component/lab-orders/table-wrapper";

export const metadata: Metadata = {
  title: "Lab Order",
  description:
    "View, track, and manage all patient laboratory test orders and their current status.",
};

export default async function StaffLabOrder() {
  return (
    <div className="relative flex flex-col gap-2 p-2 overflow-y-auto">
      <LabOrdersHeading />
      <TableWrapper basePath="/staff/lab-orders" />
    </div>
  );
}
