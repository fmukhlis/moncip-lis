import Link from "next/link";
import OrderCard from "./_component/order-card";
import PatientCard from "./_component/patient-card";
import StickyHeader from "./_component/sticky-header";
import TimelineCard from "./_component/timeline-card";
import SpecimensCard from "./_component/specimens-card";
import OrderItemsCard from "./_component/order-items-card";
import CreateSpecimenDialog from "./_component/create-specimen-dialog";
import EncounterAndDoctorCard from "./_component/encounter-and-doctor-card";
import ClinicalInformationCard from "./_component/clinical-information-card";
import { Button } from "@/components/ui/button";
import { Portal } from "radix-ui";
import { Metadata } from "next";
import { LabOrderDetailProvider } from "./context";
import { ArrowLeft, FlaskConical, NotebookText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReassignSpecimenDialog from "./_component/reassign-specimen-dialog";
import CancelSpecimenDialog from "./_component/cancel-specimen-dialog";
import CollectSpecimenDialog from "./_component/collect-specimen-dialog";
import ReceiveSpecimenDialog from "./_component/receive-specimen-dialog";

export const metadata: Metadata = {
  title: "Lab Order Detail",
  description:
    "View, track, and manage all patient laboratory test orders and their current status.",
};

export default async function StaffLabOrderDetail({
  params,
}: {
  params: Promise<{ labOrderId: string }>;
}) {
  const { labOrderId } = await params;

  return (
    <div className="overflow-y-auto flex flex-col gap-2 p-2 relative">
      <Card>
        <CardHeader className="gap-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-tight leading-none">
                Lab Order Detail
              </h1>
              <p className="text-muted-foreground text-sm">
                Detailed view of patient laboratory orders, specimen tracking,
                and final test results.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant={"outline"}>
                <Link href={`/staff/lab-orders`}>
                  <ArrowLeft />
                  Back to Lab Orders
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <LabOrderDetailProvider>
        <StickyHeader labOrderId={labOrderId} />

        <div className="grid grid-cols-1 gap-2 md:grid-cols-3 items-start">
          <PatientCard labOrderId={labOrderId} />
          <EncounterAndDoctorCard labOrderId={labOrderId} />
          <OrderCard labOrderId={labOrderId} />
        </div>

        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_272px]">
          <div className="space-y-2">
            <ClinicalInformationCard labOrderId={labOrderId} />
            <OrderItemsCard labOrderId={labOrderId} />
            <SpecimensCard labOrderId={labOrderId} />
            <Card>
              <CardHeader className="gap-0">
                <CardTitle className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <NotebookText className="size-4" />
                  Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                  <FlaskConical className="mb-3 h-9 w-9 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Fitur hasil pemeriksaan belum tersedia
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    Akan tersedia pada pembaruan berikutnya
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <TimelineCard />
          </div>
        </div>

        <Portal.Root>
          <ReassignSpecimenDialog labOrderId={labOrderId} />
          <CreateSpecimenDialog labOrderId={labOrderId} />
          <CancelSpecimenDialog labOrderId={labOrderId} />
          <CollectSpecimenDialog labOrderId={labOrderId} />
          <ReceiveSpecimenDialog labOrderId={labOrderId} />
        </Portal.Root>
      </LabOrderDetailProvider>
    </div>
  );
}
