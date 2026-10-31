import { Metadata } from "next";
import { PlaceholderPage } from "@/app/(authenticated)/_component/placeholder-page";

export const metadata: Metadata = {
  title: "Specimen Receipt",
  description:
    "Record specimen receipt and track specimens accepted by the laboratory.",
};

export default async function StaffSpecimenReceipt() {
  return (
    <PlaceholderPage
      title="Specimen Receipt"
      description="Record specimen receipt and track specimens accepted by the laboratory."
    />
  );
}
