import { Session } from "next-auth";
import { createLaboratory } from "./dal/query";

export async function createLaboratoryAction(user: Session["user"]) {
  if (user?.id && !user?.laboratoryId && user?.role === "admin") {
    await createLaboratory(user.id);
    return {
      success: true,
      message: "Laboratory created successfully.",
      data: null,
    };
  }

  return {
    success: false,
    message: "User already has a laboratory or lacks privileges.",
    data: null,
  };
}
