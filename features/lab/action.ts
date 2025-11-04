import { Session } from "next-auth";
import { createLaboratory } from "./dal/query";

export async function createLaboratoryAction(user: Session["user"]) {
  if (user?.id && !user?.laboratoryId && user?.role === "admin") {
    await createLaboratory(user.id);
  }
}
