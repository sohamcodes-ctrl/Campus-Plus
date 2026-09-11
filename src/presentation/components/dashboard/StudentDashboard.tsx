"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, ComplaintDTO } from "@/presentation/services/apiClient";
import { Card } from "@/presentation/components/primitives/Card";
import { Button } from "@/presentation/components/primitives/Button";
import { Badge } from "@/presentation/components/primitives/Badge";
import { Skeleton } from "@/presentation/components/primitives/Skeleton";
import { AlertBanner } from "@/presentation/components/feedback/AlertBanner";
import { TrackingCodeBadge } from "@/presentation/components/domain/TrackingCodeBadge";
import { StatusPill } from "@/presentation/components/domain/StatusPill";
import { PriorityBadge } from "@/presentation/components/domain/PriorityBadge";

export function StudentDashboard() {
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
          setFetchError(err instanceof Error ? err.message : "Failed to load your complaints.");
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

  // Compute metrics strictly from real API data
  const totalCount = complaints.length;
  const activeCount = complaints.filter((c) =>
    ["SUBMITTED", "REVIEWED", "ASSIGNED", "IN_PROGRESS", "FORWARDED", "ESCALATED", "REOPENED"].includes(c.status)
  ).length;
  const pendingVerification = complaints.filter((c) => c.status === "RESOLVED");
  const closedCount = complaints.filter((c) => c.status === "CLOSED").length;

  return (
    <div className="space-y-6">
      {/* Identity & Greeting Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome, Student Portal
              </h1>
              <Badge variant="role" size="sm" dot>
                Active Complainant
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Submit campus complaints, monitor real-time triage, and verify resolution outcomes.
            </p>
          </div>

          {/* Primary Action CTA — Visually Dominant */}
          <Link href="/complaints/new">
            <Button
              variant="primary"
              size="lg"
              className="font-bold shadow-sm ring-2 ring-[var(--role-primary)]/20"
              leftIcon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Submit New Grievance
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Required Section: Verification Prompt */}
      {pendingVerification.length > 0 && (
        <AlertBanner variant="warning" title="Action Required: Resolution Verification Pending">
          <div className="space-y-2 mt-1">
            <p className="text-xs text-amber-900">
              You have {pendingVerification.length} complaint(s) marked as <strong>RESOLVED</strong>. Please verify the resolution or dispute within 5 business days before automatic closure.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {pendingVerification.map((pv) => (
                <Link key={pv.id} href={`/complaints/${pv.id}`}>
                  <Button variant="outline" size="sm" className="bg-white/80 border-amber-300 text-amber-900 text-xs">
                    Verify {pv.trackingCode} &rarr;
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </AlertBanner>
      )}

      {/* Real Complaint Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Filed</span>
          <p className="text-2xl font-extrabold text-slate-900">{isLoading ? "—" : totalCount}</p>
          <span className="text-[11px] text-slate-400">All-time submissions</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active In-Progress</span>
          <p className="text-2xl font-extrabold text-blue-600">{isLoading ? "—" : activeCount}</p>
          <span className="text-[11px] text-slate-400">Being handled</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Verification</span>
          <p className="text-2xl font-extrabold text-amber-600">{isLoading ? "—" : pendingVerification.length}</p>
          <span className="text-[11px] text-slate-400">Requires your review</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Closed</span>
          <p className="text-2xl font-extrabold text-slate-700">{isLoading ? "—" : closedCount}</p>
          <span className="text-[11px] text-slate-400">Verified &amp; archived</span>
        </div>
      </div>

      {/* "My Active Complaints" Worklist */}
      <Card
        title="My Active Complaints"
        description="Track the status, assigned department, and lifecycle progression of your grievances."
      >
        {!isLoading && fetchError && (
          <AlertBanner variant="error" title="Unable to Load Complaints">
            {fetchError}
          </AlertBanner>
        )}

        {!fetchError && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse" aria-label="Student Complaints List">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3 font-semibold">Tracking Code</th>
                  <th className="py-3 px-3 font-semibold">Subject</th>
                  <th className="py-3 px-3 font-semibold">Category</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Priority</th>
                  <th className="py-3 px-3 font-semibold">Submitted Date</th>
                  <th className="py-3 px-3 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-6 px-3">
                      <div className="space-y-3">
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="85%" />
                        <Skeleton variant="text" width="65%" />
                      </div>
                    </td>
                  </tr>
                ) : complaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 px-3 text-center">
                      <div className="space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900">No complaints registered yet</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          If you are facing infrastructure, academic, or campus facilities issues, submit your complaint to begin structured resolution.
                        </p>
                        <div className="pt-2">
                          <Link href="/complaints/new">
                            <Button variant="primary" size="md">
                              Submit Your First Complaint
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <TrackingCodeBadge trackingCode={c.trackingCode} size="sm" />
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900 max-w-xs truncate">
                        {c.title}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        {c.categoryId || "General"}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusPill status={c.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <PriorityBadge priority={c.suggestedPriority} size="sm" />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-right">
                        <Link
                          href={`/complaints/${c.id}`}
                          className="inline-flex items-center text-[var(--role-btn-text,#1E3A5F)] font-semibold hover:underline"
                        >
                          View &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
