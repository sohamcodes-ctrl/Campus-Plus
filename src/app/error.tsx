"use client";

import React from "react";
import { Button } from "@/presentation/components/primitives/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-5">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-600" aria-hidden="true" />
        <span>Campus Plus &bull; Operational Resilience</span>
      </div>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-rose-200 text-rose-600 font-extrabold text-2xl shadow-xs">
        !
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          System Request Interrupted
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          An unexpected operational exception prevented this view from completing. Your session and ledger state remain securely intact.
        </p>
        {error.digest && (
          <p className="text-[11px] font-mono text-slate-400 pt-1">
            Reference Incident Digest: {error.digest}
          </p>
        )}
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" size="md" onClick={() => reset()}>
          Retry Action
        </Button>
        <a href="/dashboard">
          <Button variant="outline" size="md">
            Return to Dashboard
          </Button>
        </a>
        <a href="/login">
          <Button variant="ghost" size="md">
            Sign In
          </Button>
        </a>
      </div>
    </div>
  );
}
