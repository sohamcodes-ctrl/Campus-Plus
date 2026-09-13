"use client";

import React from "react";
import Link from "next/link";

export interface StudentActionRequiredBannerProps {
  pendingCount: number;
  firstPendingComplaintId?: string;
}

export function StudentActionRequiredBanner({
  pendingCount,
  firstPendingComplaintId,
}: StudentActionRequiredBannerProps) {
  if (pendingCount <= 0) {
    return null;
  }

  const reviewHref = firstPendingComplaintId
    ? `/complaints/${firstPendingComplaintId}`
    : "/complaints";

  return (
    <div
      role="region"
      aria-label="Action Required Notification"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-[#FFFBEB] p-4 sm:p-5 shadow-xs"
    >
      <div className="flex items-start sm:items-center gap-3.5">
        {/* Warning Triangle Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100/80 text-amber-600">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Action Required
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            You have{" "}
            <span className="font-semibold text-slate-800">
              {pendingCount} complaint{pendingCount > 1 ? "s" : ""}
            </span>{" "}
            awaiting your verification. Please review and verify to help us close
            it.
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <Link
          href={reviewHref}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#E58A00] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#C97800] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E58A00]"
        >
          <span>Review Now</span>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
