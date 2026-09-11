"use client";

import React from "react";
import { cn } from "@/presentation/utils/cn";
import { AlertVariant } from "./AlertBanner";

export interface ToastProps {
  id: string;
  variant?: AlertVariant;
  title?: string;
  message: string;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  variant = "info",
  title,
  message,
  onDismiss,
}) => {
  const variantStyles: Record<AlertVariant, string> = {
    info: "border-blue-200 bg-white text-slate-800",
    success: "border-emerald-200 bg-white text-slate-800",
    warning: "border-amber-200 bg-white text-slate-800",
    error: "border-red-200 bg-white text-slate-800",
  };

  const dotColors: Record<AlertVariant, string> = {
    info: "bg-blue-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-md transition-all",
        variantStyles[variant]
      )}
    >
      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", dotColors[variant])} />
      <div className="grow space-y-0.5 text-sm">
        {title && <p className="font-semibold text-slate-900">{title}</p>}
        <p className="text-slate-600">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};
