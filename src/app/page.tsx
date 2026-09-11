import React from "react";
import { Card } from "@/presentation/components/Card";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-800 antialiased">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="border-b border-slate-200 pb-5">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Campus Plus
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Campus Complaint &amp; Grievance Resolution System — Engineering Foundation
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card
            title="System Status"
            description="Phase 03 — Engineering Foundation & Project Initialization"
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-500">Architecture</span>
                <span className="font-medium text-emerald-600">Modular Monolith</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-500">Framework</span>
                <span className="font-medium text-slate-800">Next.js (App Router)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-500">Language</span>
                <span className="font-medium text-slate-800">TypeScript 5.x</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Package Manager</span>
                <span className="font-medium text-slate-800">pnpm</span>
              </div>
            </div>
          </Card>

          <Card
            title="Observability & Health"
            description="Technical health check and liveness endpoints"
          >
            <div className="space-y-3 text-sm">
              <p className="text-slate-600">
                System health endpoints provide decoupled liveness and readiness monitoring.
              </p>
              <div className="pt-2">
                <a
                  href="/api/health"
                  className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  Inspect /api/health →
                </a>
              </div>
            </div>
          </Card>
        </div>

        <footer className="border-t border-slate-200 pt-4 text-xs text-slate-400">
          Campus Plus &bull; Confidential Academic Software &bull; Phase 03 Foundation Active
        </footer>
      </div>
    </main>
  );
}
