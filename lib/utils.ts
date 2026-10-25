import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextRequest } from "next/server";
import { differenceInMonths, differenceInYears } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const numberFormatter = new Intl.NumberFormat("id-ID", {
  style: "decimal",
  useGrouping: true,
  maximumFractionDigits: 0,
});

export function extractBearerToken(req: NextRequest) {
  const auth = req.headers.get("Authorization");

  if (!auth) return null;

  if (!auth.startsWith("Bearer ")) return null;

  const token = auth.slice(7).trim();

  if (!token) return null;

  return token;
}

export function getPatientAge(dob: Date) {
  const years = differenceInYears(new Date(), dob);

  if (years >= 1) {
    return `${years} y`;
  }

  const months = differenceInMonths(new Date(), dob);
  return `${months} mo`;
}
