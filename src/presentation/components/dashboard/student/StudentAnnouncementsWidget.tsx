"use client";

import React from "react";

export interface AnnouncementItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

export interface StudentAnnouncementsWidgetProps {
  announcements?: AnnouncementItem[];
}

export function StudentAnnouncementsWidget({
  announcements = [],
}: StudentAnnouncementsWidgetProps) {
  return (
    <div
      id="announcements"
      className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Announcements
        </h2>
        {announcements.length > 0 && (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
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
          </button>
        )}
      </div>

      {/* Announcements List or Honest Empty State */}
      {announcements.length > 0 ? (
        <div className="space-y-3.5 divide-y divide-slate-100">
          {announcements.map((a) => (
            <div key={a.id} className="pt-2 first:pt-0 space-y-1">
              <div className="flex items-start gap-2.5">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {a.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2">
                    {a.description}
                  </p>
                  <p className="text-[10px] text-slate-400 pt-0.5">{a.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Honest Institutional Empty State (No backend API exists per GAP-001) */
        <div className="py-6 px-2 text-center space-y-2.5">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF2FB] text-[#1E3A5F]">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
            No campus announcements at this time.
          </h3>
          <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto leading-relaxed">
            Administrative notices will appear here once published.
          </p>
        </div>
      )}
    </div>
  );
}
