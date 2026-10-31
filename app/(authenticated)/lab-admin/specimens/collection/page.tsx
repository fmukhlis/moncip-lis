import { Metadata } from "next";
import { PlaceholderPage } from "@/app/(authenticated)/_component/placeholder-page";

export const metadata: Metadata = {
  title: "Specimen Collection",
  description:
    "Record specimen collection details and track collections that are still pending.",
};

export default async function LabAdminSpecimenCollection() {
  return (
    <PlaceholderPage
      title="Specimen Collection"
      description="Record specimen collection details and track collections that are still pending."
    />
  );
}
