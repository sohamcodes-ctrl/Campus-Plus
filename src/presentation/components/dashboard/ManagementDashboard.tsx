"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, ComplaintDTO } from "@/presentation/services/apiClient";
import { Card } from "@/presentation/components/primitives/Card";
import { Badge } from "@/presentation/components/primitives/Badge";
import { Skeleton } from "@/presentation/components/primitives/Skeleton";
import { AlertBanner } from "@/presentation/components/feedback/AlertBanner";
import { TrackingCodeBadge } from "@/presentation/components/domain/TrackingCodeBadge";
import { StatusPill } from "@/presentation/components/domain/StatusPill";
import { PriorityBadge } from "@/presentation/components/domain/PriorityBadge";
import { Button } from "@/presentation/components/primitives/Button";

export function ManagementDashboard() {
  const [complaints, setComplaints] = useState<ComplaintDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        setFetchError(null);
        const res = await apiClient.listComplaints({ limit: 50 });
        if (isMounted) {
          setComplaints(res.items || []);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setFetchError(err instanceof Error ? err.message : "Failed to load management overview.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const totalCampusCount = complaints.length;
  const criticalUrgent = complaints.filter((c) => c.suggestedPriority === "URGENT" || c.status === "ESCALATED");
  const resolvedClosed = complaints.filter((c) => ["RESOLVED", "CLOSED"].includes(c.status));

  return (
    <div className="space-y-6">
      {/* Management Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Institutional Management &amp; Executive Governance
              </h1>
              <Badge variant="role" size="sm" dot>
                Campus-Wide Purview
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Institutional intelligence, high-urgency bottleneck resolution, and Tier 3 management escalations.
            </p>
          </div>
        </div>
      </div>

      {/* Campus-Wide Executive Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Campus Total</span>
          <p className="text-2xl font-extrabold text-slate-900">{isLoading ? "—" : totalCampusCount}</p>
          <span className="text-[11px] text-slate-400">All departments</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical / Escalated</span>
          <p className="text-2xl font-extrabold text-rose-600">{isLoading ? "—" : criticalUrgent.length}</p>
          <span className="text-[11px] text-slate-400">Executive attention</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved / Closed</span>
          <p className="text-2xl font-extrabold text-emerald-600">{isLoading ? "—" : resolvedClosed.length}</p>
          <span className="text-[11px] text-slate-400">Verified resolution</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Governance Audit</span>
          <p className="text-sm font-semibold text-slate-500 pt-1">Audit metrics unavailable</p>
          <span className="text-[11px] text-slate-400">Backend telemetry pending</span>
        </div>
      </div>

      {/* Critical & Escalated Queue */}
      <Card
        title="Executive Attention Queue"
        description="Grievances with elevated priority or active escalation requiring senior leadership awareness."
      >
        {isLoading && (
          <div className="space-y-3 pt-2">
            <Skeleton variant="text" />
            <Skeleton variant="text" width="80%" />
          </div>
        )}

        {!isLoading && fetchError && (
          <AlertBanner variant="error" title="Error Loading Executive Queue">
            {fetchError}
          </AlertBanner>
        )}

        {!isLoading && !fetchError && criticalUrgent.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-500">
            Zero active escalations or urgent alerts requiring executive intervention.
          </div>
        )}

        {!isLoading && !fetchError && criticalUrgent.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse" aria-label="Executive Attention Queue">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">Reference</th>
                    <th className="py-2.5 px-3 font-semibold">Title</th>
                    <th className="py-2.5 px-3 font-semibold">Priority</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {criticalUrgent.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <TrackingCodeBadge trackingCode={c.trackingCode} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 max-w-xs truncate">
                        {c.title}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <PriorityBadge priority={c.suggestedPriority} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <StatusPill status={c.status} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-right">
                        <Link
                          href={`/complaints/${c.id}`}
                          className="text-[var(--role-btn-text,#3D1C22)] font-semibold hover:underline"
                        >
                          Inspect &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-3 pt-2">
              {criticalUrgent.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <TrackingCodeBadge trackingCode={c.trackingCode} size="sm" />
                    <StatusPill status={c.status} size="sm" />
                  </div>
                  <h4 className="font-semibold text-xs text-slate-900 line-clamp-2">
                    {c.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <PriorityBadge priority={c.suggestedPriority} size="sm" />
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Link href={`/complaints/${c.id}`} className="block pt-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Inspect Details &rarr;
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Honest Analytics State */}
      <Card
        title="Institutional Intelligence &amp; Hotspot Analytics"
        description="Cross-department recurring complaint clusters and long-term resolution velocity."
      >
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-8 text-center space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-slate-800">Cluster Analytics Service Pending Backend Integration</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Per Campus Plus architectural standards, cluster analytics and campus KPI graphs require authoritative backend aggregation endpoints. No fabricated graphs or artificial metrics are presented.
          </p>
        </div>
      </Card>
    </div>
  );
}
