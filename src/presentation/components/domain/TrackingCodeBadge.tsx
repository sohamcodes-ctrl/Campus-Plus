"use client";

import React, { useState } from "react";
import { cn } from "@/presentation/utils/cn";

export interface TrackingCodeBadgeProps {
  trackingCode: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const TrackingCodeBadge: React.FC<TrackingCodeBadgeProps> = ({
  trackingCode,
  className,
  size = "md",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(trackingCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(false);
    }
  };

  const sizeClasses: Record<string, { badge: string; font: string; icon: string }> = {
    sm: { badge: "px-2 py-0.5 gap-1.5", font: "text-xs", icon: "h-3 w-3" },
    md: { badge: "px-2.5 py-1 gap-2", font: "text-xs font-semibold", icon: "h-3.5 w-3.5" },
    lg: { badge: "px-3 py-1.5 gap-2.5", font: "text-sm font-bold", icon: "h-4 w-4" },
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-slate-300 bg-slate-50 font-mono text-slate-800 shadow-2xs select-all",
        sizeClasses[size].badge,
        className
      )}
    >
      <span className={cn("tracking-wider", sizeClasses[size].font)}>{trackingCode}</span>

      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy tracking code ${trackingCode}`}
        title="Copy tracking code"
        className="rounded p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
      >
        {copied ? (
          <svg
            className={cn("text-emerald-600", sizeClasses[size].icon)}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className={sizeClasses[size].icon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>

      {/* Screen reader live region */}
      <span className="sr-only" aria-live="polite">
        {copied ? `Tracking code ${trackingCode} copied to clipboard` : ""}
      </span>
    </span>
  );
};
