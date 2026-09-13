"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/presentation/components/primitives/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-5">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
        <span>Campus Plus &bull; Resource Router</span>
      </div>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-700 font-extrabold text-2xl shadow-xs">
        404
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          The requested resource, grievance ledger record, or navigation route does not exist in Campus Plus. Please verify the URL or return to your authorized dashboard.
        </p>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard">
          <Button variant="primary" size="md">
            Return to Dashboard
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="md">
            Campus Plus Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
