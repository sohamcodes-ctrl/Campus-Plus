"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/presentation/context/AuthContext";
import { apiClient, ComplaintDTO } from "@/presentation/services/apiClient";
import { Card } from "@/presentation/components/primitives/Card";
import { Badge } from "@/presentation/components/primitives/Badge";
import { Skeleton } from "@/presentation/components/primitives/Skeleton";
import { AlertBanner } from "@/presentation/components/feedback/AlertBanner";
import { TrackingCodeBadge } from "@/presentation/components/domain/TrackingCodeBadge";
import { StatusPill } from "@/presentation/components/domain/StatusPill";
import { PriorityBadge } from "@/presentation/components/domain/PriorityBadge";
import { Button } from "@/presentation/components/primitives/Button";

export function HandlerDashboard() {
  const { actor } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"assigned" | "department">("assigned");

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
          setFetchError(err instanceof Error ? err.message : "Failed to load operational queue.");
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

  const assignedToMe = complaints.filter(
    (c) => "assignedHandlerId" in c && c.assignedHandlerId === actor?.userId
  );
  const inProgressCount = assignedToMe.filter((c) => c.status === "IN_PROGRESS").length;
  const urgentCount = complaints.filter((c) => c.suggestedPriority === "URGENT" || c.suggestedPriority === "HIGH").length;
  const escalatedCount = complaints.filter((c) => c.status === "ESCALATED").length;

  const displayList = activeTab === "assigned" ? assignedToMe : complaints;

  return (
    <div className="space-y-6">
      {/* Handler Identity Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Complaint Handler Workspace
              </h1>
              <Badge variant="role" size="sm" dot>
                Operational Queue
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {actor?.departmentId ? `Department: ${actor.departmentId}` : "Department Scope Active"} — Manage assigned complaints, log progress, and record resolutions.
            </p>
          </div>
        </div>
      </div>

      {/* Operational Work Queue Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned to Me</span>
          <p className="text-2xl font-extrabold text-teal-700">{isLoading ? "—" : assignedToMe.length}</p>
          <span className="text-[11px] text-slate-400">Direct operational workload</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</span>
          <p className="text-2xl font-extrabold text-emerald-700">{isLoading ? "—" : inProgressCount}</p>
          <span className="text-[11px] text-slate-400">Active investigation</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High / Urgent Priority</span>
          <p className="text-2xl font-extrabold text-amber-700">{isLoading ? "—" : urgentCount}</p>
          <span className="text-[11px] text-slate-400">SLA critical attention</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Escalations</span>
          <p className="text-2xl font-extrabold text-rose-700">{isLoading ? "—" : escalatedCount}</p>
          <span className="text-[11px] text-slate-400">Tier 1 &amp; 2 active</span>
        </div>
      </div>

      {/* Tabbed Operational Worklist */}
      <Card
        title="Operational Action Queue"
        description="Process active complaints, update execution status, or forward misrouted cases."
      >
        <div className="flex border-b border-slate-200 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("assigned")}
            className={`pb-2 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "assigned"
                ? "border-[var(--role-primary,#7FC4B2)] text-[var(--role-btn-text,#1A3830)]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            My Assigned Worklist ({assignedToMe.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("department")}
            className={`pb-2 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "department"
                ? "border-[var(--role-primary,#7FC4B2)] text-[var(--role-btn-text,#1A3830)]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Department Queue ({complaints.length})
          </button>
        </div>

        {isLoading && (
          <div className="space-y-3 pt-2">
            <Skeleton variant="text" />
            <Skeleton variant="text" width="80%" />
          </div>
        )}

        {!isLoading && fetchError && (
          <AlertBanner variant="error" title="Error Loading Queue">
            {fetchError}
          </AlertBanner>
        )}

        {!isLoading && !fetchError && displayList.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-500">
            No complaints currently match this filter. All assigned tasks are up to date.
          </div>
        )}

        {!isLoading && !fetchError && displayList.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse" aria-label="Handler Worklist">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">Reference</th>
                    <th className="py-2.5 px-3 font-semibold">Title</th>
                    <th className="py-2.5 px-3 font-semibold">Priority</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayList.map((c) => (
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
                          className="text-[var(--role-btn-text,#1A3830)] font-semibold hover:underline"
                        >
                          Manage &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-3 pt-2">
              {displayList.map((c) => (
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
                      Manage Complaint &rarr;
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
