"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/presentation/context/AuthContext";
import { apiClient, ComplaintDTO } from "@/presentation/services/apiClient";
import { PaginationMeta } from "@/presentation/utils/apiResponse";
import { AlertBanner } from "@/presentation/components/feedback/AlertBanner";

import { StudentWelcomeHero } from "./student/StudentWelcomeHero";
import { StudentStatsRow } from "./student/StudentStatsRow";
import { StudentActionRequiredBanner } from "./student/StudentActionRequiredBanner";
import { StudentRecentComplaintsTable } from "./student/StudentRecentComplaintsTable";
import { StudentQuickActions } from "./student/StudentQuickActions";
import { StudentAnnouncementsWidget } from "./student/StudentAnnouncementsWidget";
import { StudentDashboardFooter } from "./student/StudentDashboardFooter";

export function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintDTO[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>();
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await apiClient.listComplaints({ page, limit: 10 });
        if (isMounted) {
          setComplaints(res.items || []);
          setPaginationMeta(res.pagination);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setFetchError(
            err instanceof Error ? err.message : "Failed to load your complaints."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [page]);

  const handlePageChange = useCallback((newPage: number) => {
    setIsLoading(true);
    setPage(newPage);
  }, []);

  // Derive metrics strictly from real API data
  const totalCount = paginationMeta?.total_records ?? complaints.length;
  const inProgressCount = complaints.filter((c) =>
    ["SUBMITTED", "REVIEWED", "ASSIGNED", "IN_PROGRESS", "FORWARDED", "ESCALATED"].includes(
      c.status
    )
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;

  // Domain semantics (Rule 8): Under the canonical FSM, complaints in RESOLVED status can only transition
  // to CLOSED (via student verification) or REOPENED (via student dispute). Once verified, the complaint
  // is CLOSED. Therefore, any complaint with status === "RESOLVED" represents a genuine pending verification action.
  const pendingVerification = complaints.filter(
    (c) => c.status === "RESOLVED" && c.resolution?.studentVerified !== true
  );

  // Authenticated student name and initials resolution
  const studentName =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    (user?.email ? user.email.split("@")[0].replace(/[._]/g, " ") : "Student Account");

  const initials = studentName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "SS";

  // Academic metadata from authenticated session (gracefully omitted if absent)
  const academicMetadata = {
    program: user?.user_metadata?.program as string | undefined,
    institution: (user?.user_metadata?.institution as string | undefined) || "R.C. Patel Institute of Technology, Shirpur",
    academicYear: user?.user_metadata?.academic_year as string | undefined,
    semester: user?.user_metadata?.semester as string | undefined,
    rollNo: (user?.user_metadata?.roll_number || user?.user_metadata?.roll_no) as string | undefined,
  };

  return (
    <div className="space-y-6">
      {/* Fetch Error Alert */}
      {fetchError && (
        <AlertBanner variant="error" title="Unable to Load Complaints">
          {fetchError}
        </AlertBanner>
      )}

      {/* 1. Student Identity Welcome Hero */}
      <StudentWelcomeHero
        studentName={studentName}
        initials={initials}
        metadata={academicMetadata}
      />

      {/* 2. Main Two-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (~68% width): Statistics, Action Banner & Recent Complaints */}
        <div className="lg:col-span-8 space-y-5">
          {/* Statistics Row (3 Primary Metric Cards) */}
          <StudentStatsRow
            totalCount={totalCount}
            inProgressCount={inProgressCount}
            resolvedCount={resolvedCount}
            isLoading={isLoading}
          />

          {/* Action Required Banner (Data-driven, conditionally rendered) */}
          <StudentActionRequiredBanner
            pendingCount={pendingVerification.length}
            firstPendingComplaintId={pendingVerification[0]?.id}
          />

          {/* Recent Complaints Table */}
          <StudentRecentComplaintsTable
            complaints={complaints}
            isLoading={isLoading}
            pagination={paginationMeta}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Right Column (~32% width): Quick Actions & Announcements */}
        <div className="lg:col-span-4 space-y-5">
          <StudentQuickActions />
          <StudentAnnouncementsWidget />
        </div>
      </div>

      {/* 3. Minimal Institutional Footer */}
      <StudentDashboardFooter />
    </div>
  );
}
