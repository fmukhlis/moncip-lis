import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const numberFormatter = new Intl.NumberFormat("id-ID", {
  style: "decimal",
  useGrouping: true,
  maximumFractionDigits: 0,
});
