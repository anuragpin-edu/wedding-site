"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "@/components/icons";

// Copies the given text to the clipboard, with a brief check confirmation.
export default function CopyButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard may be blocked; ignore.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
      className={
        "inline-flex items-center gap-1.5 text-maroon/70 transition-colors hover:text-maroon " +
        className
      }
    >
      {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
      <span className="text-xs">{copied ? "Copied" : label}</span>
    </button>
  );
}
