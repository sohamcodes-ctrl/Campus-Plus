"use client";

import React from "react";
import Image from "next/image";

export interface AcademicMetadata {
  program?: string;
  institution?: string;
  academicYear?: string;
  semester?: string;
  rollNo?: string;
}

export interface StudentWelcomeHeroProps {
  studentName: string;
  initials: string;
  metadata?: AcademicMetadata;
}

export function StudentWelcomeHero({
  studentName,
  initials,
  metadata,
}: StudentWelcomeHeroProps) {
  const institutionName =
    metadata?.institution || "R.C. Patel Institute of Technology, Shirpur";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      {/* Background Campus Illustration (Right-aligned, soft institutional blend) */}
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-full sm:w-1/2 lg:w-5/12 overflow-hidden opacity-35 sm:opacity-50"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <div className="relative h-full w-full">
          <Image
            src="/images/student-hero-campus.png"
            alt=""
            fill
            className="object-cover object-right"
            priority
          />
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-20 max-w-2xl space-y-4">
        {/* Identity Row */}
        <div className="flex items-center gap-4">
          {/* Avatar Circle */}
          <div
            className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-[#7FA8D9] text-[#1E3A5F] text-lg sm:text-xl font-bold shadow-xs select-none"
            aria-hidden="true"
          >
            {initials}
          </div>

          <div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Welcome back,
            </p>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {studentName}
            </h1>
          </div>
        </div>

        {/* Academic Metadata Chips (Data-driven, gracefully omitted if absent per contract) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {metadata?.program && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#B8D0EC] bg-[#EAF2FB]/80 px-2.5 py-1 text-xs font-medium text-[#33475B]">
              <svg
                className="h-3.5 w-3.5 text-[#1E3A5F]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 14l9-5-9-5-9 5 9 5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
              </svg>
              <span>{metadata.program}</span>
            </span>
          )}

          {/* Institutional Affiliation Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#B8D0EC] bg-[#EAF2FB]/80 px-2.5 py-1 text-xs font-medium text-[#33475B]">
            <svg
              className="h-3.5 w-3.5 text-[#1E3A5F]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span>{institutionName}</span>
          </span>

          {metadata?.academicYear && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#B8D0EC] bg-[#EAF2FB]/80 px-2.5 py-1 text-xs font-medium text-[#33475B]">
              <svg
                className="h-3.5 w-3.5 text-[#1E3A5F]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Academic Year: {metadata.academicYear}</span>
            </span>
          )}

          {metadata?.semester && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#B8D0EC] bg-[#EAF2FB]/80 px-2.5 py-1 text-xs font-medium text-[#33475B]">
              <svg
                className="h-3.5 w-3.5 text-[#1E3A5F]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span>Semester: {metadata.semester}</span>
            </span>
          )}

          {metadata?.rollNo && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#B8D0EC] bg-[#EAF2FB]/80 px-2.5 py-1 text-xs font-medium text-[#33475B]">
              <svg
                className="h-3.5 w-3.5 text-[#1E3A5F]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
              <span>Roll No: {metadata.rollNo}</span>
            </span>
          )}
        </div>

        {/* Institutional Mission Quote */}
        <div className="flex items-center gap-2 pt-1 text-xs font-medium text-slate-600">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-black font-serif leading-none"
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <span>Your voice matters. We are here to listen, act, and resolve.</span>
        </div>
      </div>
    </div>
  );
}
