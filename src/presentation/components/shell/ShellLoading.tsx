"use client";

import React from "react";
import { Skeleton } from "@/presentation/components/primitives/Skeleton";

export const ShellLoading: React.FC = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--role-primary,#7FA8D9)] text-[var(--role-btn-text,#1E3A5F)] font-black text-lg animate-pulse">
        C+
      </div>
      <p className="text-sm font-medium text-slate-700">
        Verifying your campus access…
      </p>
      <div className="w-48 space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  );
};
