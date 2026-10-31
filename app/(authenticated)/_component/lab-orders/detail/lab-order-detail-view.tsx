import Link from "next/link";
import OrderCard from "./order-card";
import PatientCard from "./patient-card";
import StickyHeader from "./sticky-header";
import TimelineCard from "./timeline-card";
import SpecimensCard from "./specimens-card";
import OrderItemsCard from "./order-items-card";
import CreateSpecimenDialog from "./create-specimen-dialog";
import EncounterAndDoctorCard from "./encounter-and-doctor-card";
import ClinicalInformationCard from "./clinical-information-card";
import { Button } from "@/components/ui/button";
import { Portal } from "radix-ui";
import { LabOrderDetailProvider } from "./context";
import { ArrowLeft, FlaskConical, NotebookText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReassignSpecimenDialog from "./reassign-specimen-dialog";
import CancelSpecimenDialog from "./cancel-specimen-dialog";
import CollectSpecimenDialog from "./collect-specimen-dialog";
import ReceiveSpecimenDialog from "./receive-specimen-dialog";

/**
 * Role-agnostic body of the lab order detail page. `basePath` is the lab order
 * list the "Back to Lab Orders" button returns to, which differs per role.
 */
export default function LabOrderDetailView({
  labOrderId,
  basePath,
}: {
  labOrderId: string;
  basePath: string;
}) {
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
                <Link href={basePath}>
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
