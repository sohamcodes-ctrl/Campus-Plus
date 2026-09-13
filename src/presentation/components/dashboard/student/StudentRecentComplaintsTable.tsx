"use client";

import React from "react";
import Link from "next/link";
import { ComplaintDTO } from "@/presentation/services/apiClient";
import { TrackingCodeBadge } from "@/presentation/components/domain/TrackingCodeBadge";
import { StatusPill } from "@/presentation/components/domain/StatusPill";
import { PriorityBadge } from "@/presentation/components/domain/PriorityBadge";
import { Skeleton } from "@/presentation/components/primitives/Skeleton";
import { PaginationMeta } from "@/presentation/utils/apiResponse";

export interface StudentRecentComplaintsTableProps {
  complaints: ComplaintDTO[];
  isLoading?: boolean;
  pagination?: PaginationMeta;
  currentPage?: number;
  onPageChange?: (newPage: number) => void;
}

export function StudentRecentComplaintsTable({
  complaints,
  isLoading = false,
  pagination,
  currentPage = 1,
  onPageChange,
}: StudentRecentComplaintsTableProps) {
  const formatCategory = (cat: string) => {
    if (!cat) return "General";
    const mapping: Record<string, string> = {
      NETWORK_WIFI: "Infrastructure",
      HOSTEL_MAINTENANCE: "Maintenance",
      CLASSROOM_INFRASTRUCTURE: "Facilities",
      ACADEMIC_EVALUATION: "Academics",
      CAMPUS_SANITATION: "Sanitation",
      ADMINISTRATION: "Administration",
      OTHER: "General",
    };
    return (
      mapping[cat] ||
      cat
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const totalRecords = pagination?.total_records ?? complaints.length;
  const pageSize = pagination?.page_size ?? 10;
  const totalPages = pagination?.total_pages ?? Math.max(1, Math.ceil(totalRecords / pageSize));
  const startRecord = totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Recent Complaints
        </h2>
        <Link
          href="/complaints"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#1E3A5F] hover:underline"
        >
          <span>View All</span>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse" aria-label="Recent Complaints Table">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
              <th scope="col" className="py-3.5 px-3 font-semibold">Tracking ID</th>
              <th scope="col" className="py-3.5 px-3 font-semibold">Title</th>
              <th scope="col" className="py-3.5 px-3 font-semibold">Category</th>
              <th scope="col" className="py-3.5 px-3 font-semibold">Priority</th>
              <th scope="col" className="py-3.5 px-3 font-semibold">Status</th>
              <th scope="col" className="py-3.5 px-3 font-semibold whitespace-nowrap">Last Updated</th>
              <th scope="col" className="py-3.5 px-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 px-3">
                  <div className="space-y-3">
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="70%" />
                  </div>
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 px-3 text-center">
                  <div className="mx-auto max-w-sm space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF2FB] text-[#1E3A5F]">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">No complaints filed yet</h3>
                    <p className="text-xs text-slate-500">
                      When you submit a grievance regarding infrastructure, facilities, or campus services, it will appear here with live tracking.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/complaints/new"
                        className="inline-flex items-center justify-center rounded-lg bg-[#7FA8D9] px-4 py-2 text-xs font-bold text-[#1E3A5F] shadow-xs hover:bg-[#6b97cb] transition-colors"
                      >
                        Submit a Complaint
                      </Link>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              complaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <Link
                      href={`/complaints/${c.id}`}
                      className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {c.trackingCode}
                    </Link>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800 max-w-xs truncate" title={c.title}>
                    {c.title}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                    {formatCategory(c.categoryId)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <PriorityBadge priority={c.suggestedPriority} size="sm" />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusPill status={c.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                    {formatDate(c.updatedAt || c.createdAt)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-center">
                    <Link
                      href={`/complaints/${c.id}`}
                      aria-label={`View details of complaint ${c.trackingCode}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Fallback */}
      <div className="md:hidden space-y-3 pt-3">
        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton variant="text" />
            <Skeleton variant="text" width="85%" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-slate-500">No complaints raised yet.</p>
            <Link
              href="/complaints/new"
              className="inline-flex items-center rounded-lg bg-[#7FA8D9] px-3 py-1.5 text-xs font-bold text-[#1E3A5F]"
            >
              Submit Complaint
            </Link>
          </div>
        ) : (
          complaints.map((c) => (
            <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <TrackingCodeBadge trackingCode={c.trackingCode} size="sm" />
                <StatusPill status={c.status} size="sm" />
              </div>
              <p className="font-semibold text-xs text-slate-900 line-clamp-2">
                {c.title}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <PriorityBadge priority={c.suggestedPriority} size="sm" />
                <span>{formatDate(c.updatedAt || c.createdAt)}</span>
              </div>
              <Link
                href={`/complaints/${c.id}`}
                className="block text-center rounded-md border border-slate-200 py-1 text-xs font-semibold text-[#1E3A5F] hover:bg-slate-50"
              >
                View Details
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && complaints.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-medium text-slate-700">{startRecord}</span> to{" "}
            <span className="font-medium text-slate-700">{endRecord}</span> of{" "}
            <span className="font-medium text-slate-700">{totalRecords}</span> complaints
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white shadow-xs">
              {currentPage}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
