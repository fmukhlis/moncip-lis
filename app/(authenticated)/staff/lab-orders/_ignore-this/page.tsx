import { Metadata } from "next";
import { SpecimenAssignmentPage } from "./specimen-assignment-page";

export const metadata: Metadata = {
  title: "Specimen Assignment",
  description:
    "Assign specimens to laboratory order items and monitor their assignment status.",
};

export default async function LabAdminSpecimenAssignment() {
  return (
    <SpecimenAssignmentPage
      simulate={
        // "error"
        // "empty"
        undefined
      }
    />
  );
}
