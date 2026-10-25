"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";

export default function ClientDateTimeText({
  dateTime,
  formatStr,
  placeholder = "—",
}: {
  dateTime?: string;
  formatStr: Parameters<typeof format>[1];
  placeholder?: string;
}) {
  const [clientDateTime, setClientDateTime] = useState(placeholder);

  useEffect(() => {
    setClientDateTime(dateTime ?? placeholder);
  }, [dateTime, placeholder]);

  return (
    <>
      {clientDateTime !== placeholder
        ? format(new Date(clientDateTime), formatStr)
        : clientDateTime}
    </>
  );
}
