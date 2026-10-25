import {
  differenceInDays,
  differenceInYears,
  differenceInMonths,
} from "date-fns";

export function formatAge(birthDate: Date): string {
  const now = new Date();

  const years = differenceInYears(now, birthDate);

  if (years >= 1) {
    return `${years} yr`;
  }

  const months = differenceInMonths(now, birthDate);

  if (months >= 1) {
    return `${months} mo`;
  }

  const days = differenceInDays(now, birthDate);

  return `${days} d`;
}
