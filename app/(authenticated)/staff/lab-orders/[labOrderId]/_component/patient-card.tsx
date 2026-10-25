"use client";

import Link from "next/link";
import ClientAgeText from "@/components/ui/client-age-text";
import ClientDateTimeText from "@/components/ui/client-date-time-text";
import { User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoRow, InfoRowSkeleton } from "./info-row";
import { useGetLabOrderActionQuery } from "@/features/lab-order/lab-order.api";
import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardContent,
} from "@/components/ui/card";

export default function PatientCard({ labOrderId }: { labOrderId: string }) {
  const { data, isFetching } = useGetLabOrderActionQuery({ id: labOrderId });

  const patient = data?.data?.patient;

  return (
    <Card>
      {isFetching || !patient ? (
        <>
          <CardHeader className="gap-0">
            <CardTitle className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <User className="size-4" />
              Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Skeleton className="w-40 h-5" />
              <Skeleton className="w-28 h-4" />
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-x-3 gap-y-2.5">
              <InfoRowSkeleton label="Date of Birth" />
              <InfoRowSkeleton label="Age" />
              <InfoRowSkeleton label="Sex" />
              <InfoRowSkeleton label="Phone" />
            </div>
          </CardContent>
          <CardFooter className="border-t">
            <div
              className={
                "flex gap-2 justify-between w-full text-xs text-muted-foreground"
              }
            >
              <Skeleton className="w-32 h-[15px]" />
              <Skeleton className="w-20 h-[15px]" />
            </div>
          </CardFooter>
        </>
      ) : (
        <>
          <CardHeader className="gap-0">
            <CardTitle className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <User className="size-4" />
              Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Link
                href="#"
                className="hover:underline text-base font-semibold leading-tight"
              >
                {patient.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                MRN: {patient.mrn}
              </p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-x-3 gap-y-2">
              <InfoRow
                label="Date of Birth"
                value={
                  <ClientDateTimeText
                    formatStr="dd MMM yyyy"
                    dateTime={patient.dateOfBirth}
                  />
                }
              />
              <InfoRow
                label="Age"
                value={<ClientAgeText birthDate={patient.dateOfBirth} />}
              />
              <InfoRow label="Sex" value={patient.sex} />
              <InfoRow label="Phone Number" value={patient.phone} />
            </div>
          </CardContent>
          <CardFooter className="border-t">
            <div
              className={
                "flex gap-2 justify-between w-full text-xs text-muted-foreground"
              }
            >
              <span>Last synced at:</span>
              <div className="font-medium leading-snug">
                <ClientDateTimeText
                  formatStr="dd MMM yyyy, HH:mm"
                  dateTime={patient.lastSyncedAt}
                />
              </div>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
