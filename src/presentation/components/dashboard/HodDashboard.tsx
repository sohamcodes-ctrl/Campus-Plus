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

export function HodDashboard() {
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
          setFetchError(err instanceof Error ? err.message : "Failed to load departmental data.");
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

  // Department oversight metrics
  const unassignedTriage = complaints.filter((c) => ["SUBMITTED", "REVIEWED"].includes(c.status));
  const inProgress = complaints.filter((c) => ["ASSIGNED", "IN_PROGRESS"].includes(c.status));
  const escalated = complaints.filter((c) => c.status === "ESCALATED");

  return (
    <div className="space-y-6">
      {/* Department Head Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Department Head Governance
              </h1>
              <Badge variant="role" size="sm" dot>
                Department Authority
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Department Oversight • Triage incoming submissions, assign handlers, and review escalated cases.
            </p>
          </div>
        </div>
      </div>

      {/* Oversight Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unassigned Triage</span>
          <p className="text-2xl font-extrabold text-purple-700">{isLoading ? "—" : unassignedTriage.length}</p>
          <span className="text-[11px] text-slate-400">Requires review &amp; assignment</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Workload</span>
          <p className="text-2xl font-extrabold text-blue-700">{isLoading ? "—" : inProgress.length}</p>
          <span className="text-[11px] text-slate-400">Assigned / In Progress</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Escalated (Tier 2)</span>
          <p className="text-2xl font-extrabold text-rose-700">{isLoading ? "—" : escalated.length}</p>
          <span className="text-[11px] text-slate-400">Awaiting HOD intervention</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Department</span>
          <p className="text-2xl font-extrabold text-slate-900">{isLoading ? "—" : complaints.length}</p>
          <span className="text-[11px] text-slate-400">Cumulative department scope</span>
        </div>
      </div>

      {/* Triage Queue */}
      <Card
        title="Department Triage &amp; Assignment Queue"
        description="Newly submitted grievances awaiting initial departmental review and handler dispatch."
      >
        {isLoading && (
          <div className="space-y-3 pt-2">
            <Skeleton variant="text" />
            <Skeleton variant="text" width="80%" />
          </div>
        )}

        {!isLoading && fetchError && (
          <AlertBanner variant="error" title="Error Loading Triage Queue">
            {fetchError}
          </AlertBanner>
        )}

        {!isLoading && !fetchError && unassignedTriage.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-500">
            No unassigned complaints in the triage queue. All incoming submissions have been reviewed.
          </div>
        )}

        {!isLoading && !fetchError && unassignedTriage.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse" aria-label="Department Triage">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">Reference</th>
                    <th className="py-2.5 px-3 font-semibold">Title</th>
                    <th className="py-2.5 px-3 font-semibold">Priority</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Triage Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unassignedTriage.map((c) => (
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
                          className="text-[var(--role-btn-text,#2B1E40)] font-semibold hover:underline"
                        >
                          Review &amp; Assign &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-3 pt-2">
              {unassignedTriage.map((c) => (
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
                      Review &amp; Assign &rarr;
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Honest Analytics State — No Fake Charts */}
      <Card
        title="Department Resolution Performance &amp; SLA Metrics"
        description="Historical turnaround times, SLA adherence distribution, and category recurring patterns."
      >
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-8 text-center space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-slate-800">Analytics Service Pending Phase 08 Aggregation Endpoint</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            In compliance with Campus Plus engineering protocol, aggregate metrics are rendered only when backed by authoritative backend calculation endpoints. No placeholder or fabricated data is presented.
          </p>
        </div>
      </Card>
    </div>
  );
}
