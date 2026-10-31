import { Metadata } from "next";
import { PlaceholderPage } from "@/app/(authenticated)/_component/placeholder-page";

export const metadata: Metadata = {
  title: "All Specimens",
  description: "View and track every specimen registered in the laboratory.",
};

export default async function LabAdminAllSpecimens() {
  return (
    <PlaceholderPage
      title="All Specimens"
      description="View and track every specimen registered in the laboratory."
    />
  );
}
