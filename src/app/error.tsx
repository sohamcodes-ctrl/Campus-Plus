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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-700 font-bold text-lg">
        !
      </div>

      <h1 className="text-xl font-bold text-slate-900 tracking-tight">
        An Application Error Occurred
      </h1>

      <p className="text-xs text-slate-500 max-w-md">
        {error.message || "A runtime exception interrupted your request."}
      </p>

      <div className="pt-2 flex gap-3">
        <Button variant="secondary" size="md" onClick={() => reset()}>
          Try Again
        </Button>
        <a href="/login">
          <Button variant="outline" size="md">
            Sign In
          </Button>
        </a>
      </div>
    </div>
  );
}
