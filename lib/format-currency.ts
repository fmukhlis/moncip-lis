export function formatCurrencyFromDecimalString(value: string) {
  if (!value) return "-";

  const [integerPart, fractionPart] = value.split(".");

  const formattedInteger = integerPart?.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (!fractionPart || /^0+$/.test(fractionPart)) {
    return `Rp${formattedInteger}`;
  }

  return `Rp${formattedInteger},${fractionPart}`;
}
