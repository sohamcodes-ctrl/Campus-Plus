"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/presentation/components/auth/ProtectedRoute";
import { apiClient, ComplaintDTO } from "@/presentation/services/apiClient";
import { Card } from "@/presentation/components/primitives/Card";
import { Button } from "@/presentation/components/primitives/Button";
import { Skeleton } from "@/presentation/components/primitives/Skeleton";
import { AlertBanner } from "@/presentation/components/feedback/AlertBanner";
import { EmptyState } from "@/presentation/components/feedback/EmptyState";
import { SearchInput } from "@/presentation/components/forms/SearchInput";
import { useAuth } from "@/presentation/context/AuthContext";
import { TrackingCodeBadge } from "@/presentation/components/domain/TrackingCodeBadge";
import { StatusPill } from "@/presentation/components/domain/StatusPill";
import { PriorityBadge } from "@/presentation/components/domain/PriorityBadge";
import { formatDate, formatCategoryLabel } from "@/presentation/utils/formatters";

const CATEGORY_OPTIONS = [
  { id: "ALL", label: "All Categories" },
  { id: "NETWORK_WIFI", label: "Network & Campus Wi-Fi" },
  { id: "HOSTEL_MAINTENANCE", label: "Hostel Maintenance & Facilities" },
  { id: "CLASSROOM_INFRASTRUCTURE", label: "Classroom & Lab Infrastructure" },
  { id: "ACADEMIC_EVALUATION", label: "Academic & Evaluation Concerns" },
  { id: "CAMPUS_SANITATION", label: "Campus Sanitation & Grounds" },
  { id: "OTHER", label: "Other General Inquiries" },
];

function ComplaintsDirectory() {
  const { role } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const isComplainant = role === "ROLE_STUDENT" || role === "ROLE_FACULTY";

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
          setFetchError(err instanceof Error ? err.message : "Failed to load complaints directory.");
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

  const filtered = complaints.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      c.trackingCode.toLowerCase().includes(query) ||
      c.title.toLowerCase().includes(query) ||
      (c.categoryId && c.categoryId.toLowerCase().includes(query));

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || c.suggestedPriority === priorityFilter;
    const matchesCategory = categoryFilter === "ALL" || c.categoryId === categoryFilter;

    return matchesQuery && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setCategoryFilter("ALL");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isComplainant ? "My Complaints Ledger" : "Grievance Directory & Records"}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {isComplainant
              ? "Track, filter, and inspect all grievances submitted under your institutional account."
              : "Search, filter, and inspect campus grievances scoped to your authorized institutional credentials."}
          </p>
        </div>
        {isComplainant ? (
          <Link href="/complaints/new">
            <Button variant="primary" size="md">
              + Submit a Complaint
            </Button>
          </Link>
        ) : (
          <Link href="/complaints/new">
            <Button variant="outline" size="md">
              + Submit New Grievance
            </Button>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="w-full lg:w-80">
          <SearchInput
            placeholder="Search by reference code or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <select
            aria-label="Filter by Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border border-slate-300 py-1.5 px-3 text-xs bg-white text-slate-700 hover:border-slate-400 focus:outline-2 focus:outline-[var(--role-primary,#7FA8D9)]"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-300 py-1.5 px-3 text-xs bg-white text-slate-700 hover:border-slate-400 focus:outline-2 focus:outline-[var(--role-primary,#7FA8D9)]"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="FORWARDED">Forwarded</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">Reopened</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            aria-label="Filter by Priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-md border border-slate-300 py-1.5 px-3 text-xs bg-white text-slate-700 hover:border-slate-400 focus:outline-2 focus:outline-[var(--role-primary,#7FA8D9)]"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="URGENT">Urgent Priority</option>
          </select>

          {(searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL" || categoryFilter !== "ALL") && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-xs">
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Complaints Table Card */}
      <Card
        title={`Grievance Records (${filtered.length})`}
        description="Authoritative, role-scoped grievances from the Campus Plus ledger."
      >
        {isLoading && (
          <div className="space-y-3 pt-2">
            <Skeleton variant="text" />
            <Skeleton variant="text" width="85%" />
            <Skeleton variant="text" width="70%" />
          </div>
        )}

        {!isLoading && fetchError && (
          <AlertBanner variant="error" title="Directory Error">
            {fetchError}
          </AlertBanner>
        )}

        {!isLoading && !fetchError && filtered.length === 0 && (
          <EmptyState
            title="No grievances match your criteria"
            description="Try adjusting your search terms or clearing status and priority filters to locate records."
            action={
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Reset All Filters
              </Button>
            }
          />
        )}

        {!isLoading && !fetchError && filtered.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse" aria-label="Complaints Directory">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3 font-semibold">Reference</th>
                    <th className="py-3 px-3 font-semibold">Title</th>
                    <th className="py-3 px-3 font-semibold">Category</th>
                    <th className="py-3 px-3 font-semibold">Status</th>
                    <th className="py-3 px-3 font-semibold">Priority</th>
                    <th className="py-3 px-3 font-semibold">Created Date</th>
                    <th className="py-3 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <TrackingCodeBadge trackingCode={c.trackingCode} size="sm" />
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900 max-w-sm truncate">
                        {c.title}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        {formatCategoryLabel(c.categoryId)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusPill status={c.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <PriorityBadge priority={c.suggestedPriority} size="sm" />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-right">
                        <Link
                          href={`/complaints/${c.id}`}
                          className="text-[var(--role-btn-text,#1E3A5F)] font-semibold hover:underline"
                        >
                          View &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3 pt-2">
              {filtered.map((c) => (
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
                    <span>{formatDate(c.createdAt)}</span>
                  </div>
                  <Link href={`/complaints/${c.id}`} className="block pt-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View Details &rarr;
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

export default function ComplaintsPage() {
  return (
    <ProtectedRoute>
      <ComplaintsDirectory />
    </ProtectedRoute>
  );
}
