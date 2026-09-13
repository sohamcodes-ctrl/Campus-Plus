"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/presentation/components/primitives/Card";
import { Badge } from "@/presentation/components/primitives/Badge";
import { Skeleton } from "@/presentation/components/primitives/Skeleton";
import { AlertBanner } from "@/presentation/components/feedback/AlertBanner";
import { formatDate, formatTime } from "@/presentation/utils/formatters";

interface HealthCheckData {
  status: string;
  database: string;
  timestamp: string;
}

export function AdminDashboard() {
  const [health, setHealth] = useState<HealthCheckData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        setIsLoading(true);
        setHealthError(null);
        const res = await fetch("/api/health");
        if (!res.ok) throw new Error(`Health check returned HTTP ${res.status}`);
        const data = await res.json();
        if (isMounted) {
          setHealth({
            status: data.status || "healthy",
            database: data.database || "connected",
            timestamp: data.timestamp || new Date().toISOString(),
          });
        }
      } catch (err: unknown) {
        if (isMounted) {
          setHealthError(err instanceof Error ? err.message : "Health endpoint unreachable.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    checkHealth();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      {/* Admin Identity Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                System Administration &amp; Operations
              </h1>
              <Badge variant="role" size="sm" dot>
                Technical Admin
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              System liveness, infrastructure status, access governance directory, and security audit integrity.
            </p>
          </div>
        </div>
      </div>

      {/* Live System Health Card */}
      <Card
        title="Application Liveness &amp; Infrastructure Health"
        description="Real-time operational status verified against GET /api/health."
      >
        {isLoading && (
          <div className="space-y-2 pt-2">
            <Skeleton variant="text" />
            <Skeleton variant="text" width="60%" />
          </div>
        )}

        {!isLoading && healthError && (
          <AlertBanner variant="error" title="Health Check Degraded">
            {healthError}
          </AlertBanner>
        )}

        {!isLoading && !healthError && health && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Service Status</span>
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
                <span className="font-bold text-slate-900 text-sm capitalize">{health.status}</span>
              </div>
              <span className="text-[11px] text-slate-400">Next.js App Router Core</span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PostgreSQL Engine</span>
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
                <span className="font-bold text-slate-900 text-sm capitalize">{health.database}</span>
              </div>
              <span className="text-[11px] text-slate-400">Supabase v17+ Active</span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Health Probe</span>
              <p className="font-mono text-xs text-slate-700">{formatTime(health.timestamp)}</p>
              <span className="text-[11px] text-slate-400">{formatDate(health.timestamp)}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Access Governance Directory */}
      <Card
        title="Role &amp; Security Boundary Directory"
        description="Configured RBAC personas and four-dimensional AuthorizationPolicy boundary."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active System Roles</h4>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li><strong className="text-slate-900">ROLE_STUDENT</strong> — Submit, view own, verify resolution</li>
              <li><strong className="text-slate-900">ROLE_HANDLER</strong> — Department queue, progress, resolve</li>
              <li><strong className="text-slate-900">ROLE_DEPT_HEAD</strong> — Department oversight, triage, assign</li>
              <li><strong className="text-slate-900">ROLE_MANAGEMENT</strong> — Campus-wide purview, Tier 3 escalations</li>
              <li><strong className="text-slate-900">ROLE_ADMIN</strong> — System health, configuration, audit access</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Security Architecture</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              In accordance with SEC-002, the frontend does not enforce authorization boundaries. All role-based access control, department scoping, and state-machine transitions are authoritatively enforced by the backend on PostgreSQL with Row Level Security.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
