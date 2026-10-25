"use client";

import { formatDistanceToNow, formatDistanceToNowStrict } from "date-fns";
import { useEffect, useState } from "react";

export default function ClientDistanceToNowText({
  strict = false,
  dateTime,
  placeholder = "—",
}: {
  strict?: boolean;
  dateTime?: string;
  placeholder?: string;
}) {
  const [clientDateTime, setClientDateTime] = useState(placeholder);

  useEffect(() => {
    setClientDateTime(dateTime ?? placeholder);
  }, [dateTime, placeholder]);

  return (
    <>
      {clientDateTime !== placeholder
        ? strict
          ? formatDistanceToNowStrict(new Date(clientDateTime))
          : formatDistanceToNow(new Date(clientDateTime))
        : clientDateTime}
    </>
  );
}
