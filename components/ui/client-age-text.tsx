"use client";

import { formatAge } from "@/lib/format-age";
import { useEffect, useState } from "react";

export default function ClientAgeText({
  birthDate,
  placeholder = "—",
}: {
  birthDate?: string;
  placeholder?: string;
}) {
  const [clientBirthDate, setClientBirthDate] = useState(placeholder);

  useEffect(() => {
    setClientBirthDate(birthDate ?? placeholder);
  }, [birthDate, placeholder]);

  return (
    <>
      {clientBirthDate !== placeholder
        ? formatAge(new Date(clientBirthDate))
        : clientBirthDate}
    </>
  );
}
