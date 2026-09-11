"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/presentation/components/primitives/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-slate-600 font-bold text-lg">
        404
      </div>

      <h1 className="text-xl font-bold text-slate-900 tracking-tight">
        Page Not Found
      </h1>

      <p className="text-xs text-slate-500 max-w-sm">
        The requested resource or page does not exist in Campus Plus.
      </p>

      <div className="pt-2">
        <Link href="/dashboard">
          <Button variant="primary" size="md">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
