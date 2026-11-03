import { Metadata } from "next";
import SpecimenAssignmentView from "@/app/(authenticated)/_component/lab-orders/specimen-assignment/specimen-assignment-view";

export const metadata: Metadata = {
  title: "Specimen Assignment",
  description:
    "Assign specimens to laboratory order items and monitor their assignment status.",
};

export default async function LabAdminSpecimenAssignment() {
  return <SpecimenAssignmentView />;
}
