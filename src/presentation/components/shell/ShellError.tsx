"use client";

import React from "react";
import { Button } from "@/presentation/components/primitives/Button";

export interface ShellErrorProps {
  error?: string | Error | null;
  onRetry?: () => void;
}

export const ShellError: React.FC<ShellErrorProps> = ({ error, onRetry }) => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : "A system error occurred while loading your campus session.";

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h2 className="text-lg font-bold text-slate-900">
        Campus Plus Session Error
      </h2>

      <p className="text-xs text-slate-500 max-w-md">
        {message}
      </p>

      {onRetry && (
        <div className="pt-2">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Retry Connection
          </Button>
        </div>
      )}
    </div>
  );
};
