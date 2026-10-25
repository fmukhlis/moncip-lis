"use client";

import ClientDateTimeText from "@/components/ui/client-date-time-text";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { addMinutes } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const now = new Date();

const DUMMY_TIMELINE = [
  {
    label: "Order Received",
    timestamp: now.toISOString(),
    completed: true,
    description: `Ordered by dr. Alice`,
  },
  {
    label: "Specimen Collected",
    timestamp: addMinutes(now, 5).toISOString(),
    completed: true,
    description: `Type: Plasma`,
  },
  {
    label: "Specimen Received",
    timestamp: addMinutes(now, 7).toISOString(),
    completed: true,
    description: `Type: Plasma`,
  },
  {
    label: "Analysis Started",
    timestamp: null,
    completed: true,
  },
  {
    label: "Result Inputted",
    timestamp: null,
    completed: false,
  },
  {
    label: "Verified",
    timestamp: null,
    completed: false,
  },
] as const;

export default function TimelineCard() {
  const timeline = DUMMY_TIMELINE;

  return (
    <Card className="sticky top-16 bg-background rounded-none shadow-none">
      <CardHeader className="gap-0">
        <CardTitle className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Clock className="size-4" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="">
        {timeline.map((event, idx) => (
          <TimelineItem
            key={event.label}
            event={event}
            isLast={idx === timeline.length - 1}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function TimelineItem({
  event,
  isLast,
}: {
  event: {
    label: string;
    timestamp: string | null;
    completed: boolean;
    description?: string;
  };
  isLast: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
            event.completed
              ? "border-primary bg-primary"
              : "border-muted-foreground/30 bg-background",
          )}
        >
          {event.completed && (
            <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
          )}
        </div>
        {!isLast && (
          <div
            className={cn(
              "my-1 w-0.5 flex-1",
              event.completed ? "bg-primary/40" : "bg-border",
            )}
            style={{ minHeight: 20 }}
          />
        )}
      </div>
      <div className="pb-4 min-w-0">
        <p
          className={cn(
            "text-sm font-medium leading-tight",
            !event.completed && "text-muted-foreground",
          )}
        >
          {event.label}
        </p>
        {event.timestamp && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            <ClientDateTimeText
              formatStr="dd MMM yyyy, HH:mm"
              dateTime={event.timestamp}
            />
          </p>
        )}
        {event.description && (
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}
