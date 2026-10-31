import { Metadata } from "next";
import LabOrderDetailView from "@/app/(authenticated)/_component/lab-orders/detail/lab-order-detail-view";

export const metadata: Metadata = {
  title: "Lab Order Detail",
  description:
    "View, track, and manage all patient laboratory test orders and their current status.",
};

export default async function LabAdminLabOrderDetail({
  params,
}: {
  params: Promise<{ labOrderId: string }>;
}) {
  const { labOrderId } = await params;

  return (
    <LabOrderDetailView
      labOrderId={labOrderId}
      basePath="/lab-admin/lab-orders"
    />
  );
}
