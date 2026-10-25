"use client";

import { useState } from "react";
import { JsonValue } from "@/generated/prisma/runtime/library";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

export default function JsonViewer({ data }: { data: JsonValue }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(json).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative rounded-lg border border-slate-800 bg-slate-900">
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCopy}
        className="absolute right-2 top-2 h-7 px-2 text-slate-300 hover:bg-slate-800 hover:text-white"
      >
        {copied ? (
          <Check className="mr-1 h-3 w-3" />
        ) : (
          <Copy className="mr-1 h-3 w-3" />
        )}
        {copied ? "Copied" : "Copy"}
      </Button>
      <pre className="max-h-72 overflow-auto p-4 text-xs leading-relaxed text-slate-200">
        <code className="font-mono">{json}</code>
      </pre>
    </div>
  );
}
