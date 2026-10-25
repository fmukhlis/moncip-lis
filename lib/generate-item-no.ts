export function buildLabOrderPeriod(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function buildLabOrderNo(period: string, sequence: number) {
  return `ORD-${period}-${String(sequence).padStart(4, "0")}`;
}

export function buildSpecimenPeriod(date: Date) {
  const year = date.getFullYear() % 100;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function buildSpecimenNo(period: string, sequence: number) {
  return `${period}${String(sequence).padStart(4, "0")}`;
}
