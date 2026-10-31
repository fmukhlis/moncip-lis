import { Metadata } from "next";
import { PlaceholderPage } from "@/app/(authenticated)/_component/placeholder-page";

export const metadata: Metadata = {
  title: "Specimen Assignment",
  description:
    "Assign specimens to laboratory order items and monitor their assignment status.",
};

export default async function LabAdminSpecimenAssignment() {
  return (
    <PlaceholderPage
      title="Specimen Assignment"
      description="Assign specimens to laboratory order items and monitor their assignment status."
    />
  );
}
