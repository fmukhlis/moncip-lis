import { Metadata } from "next";
import { PlaceholderPage } from "@/app/(authenticated)/staff/_component/placeholder-page";

export const metadata: Metadata = {
  title: "Exception Management",
  description:
    "Review and resolve specimen exceptions such as rejections and cancellations.",
};

export default async function StaffSpecimenExceptionManagement() {
  return (
    <PlaceholderPage
      title="Exception Management"
      description="Review and resolve specimen exceptions such as rejections and cancellations."
    />
  );
}
