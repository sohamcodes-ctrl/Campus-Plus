"use client";

import React from "react";
import { Skeleton } from "@/presentation/components/primitives/Skeleton";

export interface StudentStatsRowProps {
  totalCount: number;
  inProgressCount: number;
  resolvedCount: number;
  isLoading?: boolean;
}

export function StudentStatsRow({
  totalCount,
  inProgressCount,
  resolvedCount,
  isLoading = false,
}: StudentStatsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {/* 1. Total Complaints */}
      <div className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 lg:p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div
          className="flex h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-full bg-[#EAF2FB] text-[#1E3A5F]"
          aria-hidden="true"
        >
          <svg
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            {isLoading ? <Skeleton variant="text" width="40px" /> : totalCount}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
            Total Complaints
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 truncate">You have raised</p>
        </div>
      </div>

      {/* 2. In Progress */}
      <div className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 lg:p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div
          className="flex h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600"
          aria-hidden="true"
        >
          <svg
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-amber-600 leading-tight">
            {isLoading ? <Skeleton variant="text" width="40px" /> : inProgressCount}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
            In Progress
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 truncate">
            Currently being handled
          </p>
        </div>
      </div>

      {/* 3. Resolved */}
      <div className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 lg:p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div
          className="flex h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
          aria-hidden="true"
        >
          <svg
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-emerald-600 leading-tight">
            {isLoading ? <Skeleton variant="text" width="40px" /> : resolvedCount}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
            Resolved
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 truncate">
            Successfully resolved
          </p>
        </div>
      </div>
    </div>
  );
}
