"use client";

import React from "react";
import { ProtectedRoute } from "@/presentation/components/auth/ProtectedRoute";
import { AppShell } from "@/presentation/components/shell/AppShell";
import { Card } from "@/presentation/components/primitives/Card";
import { Badge } from "@/presentation/components/primitives/Badge";
import { Button } from "@/presentation/components/primitives/Button";
import { useAuth } from "@/presentation/context/AuthContext";
import { formatRoleLabel } from "@/presentation/navigation/navigationConfig";
import { formatDepartmentName } from "@/presentation/utils/formatters";

function ProfileContent() {
  const { user, actor, role, signOut } = useAuth();

  const fullName =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    (user?.email ? user.email.split("@")[0].replace(/[._]/g, " ") : "Institutional User");

  const institutionName =
    (user?.user_metadata?.institution as string) || "R.C. Patel Institute of Technology";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--role-primary,#7FA8D9)] text-[var(--role-btn-text,#1E3A5F)] font-black text-xl shadow-xs">
              {fullName
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase() || "CP"}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 capitalize">
                  {fullName}
                </h1>
                <Badge variant="role" size="sm" dot>
                  {formatRoleLabel(role)}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {institutionName} &bull; {user?.email || "Campus Account"}
              </p>
            </div>
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Account Details & Role Governance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title="Institutional Credentials"
          description="Verified account identity and departmental binding."
        >
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Official Email</span>
              <span className="font-mono text-slate-900">{user?.email || "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Authorized Role</span>
              <span className="font-semibold text-slate-900">{formatRoleLabel(role)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Department Jurisdiction</span>
              <span className="font-semibold text-slate-900">
                {formatDepartmentName(actor?.departmentId)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Campus Body</span>
              <span className="font-medium text-slate-900">{institutionName}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-semibold">Session Token</span>
              <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                Active (JWT Verified)
              </span>
            </div>
          </div>
        </Card>

        <Card
          title="Identity & Access Governance"
          description="Institutional privacy and central registry authority."
        >
          <div className="space-y-4 pt-2">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center space-x-2 text-slate-800 font-bold">
                <svg
                  className="h-4 w-4 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Centralized IAM Compliance</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Profile records, departmental affiliations, and access roles are authoritatively synchronized with the university central directory. Personal self-service credential mutation is restricted under institutional access policy.
              </p>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <span className="font-semibold text-slate-700">Need to update your details?</span>
              <p className="text-[11px]">
                To update your department, full name, or campus credentials, please contact your departmental administrator or submit an inquiry to the IT Helpdesk.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <ProfileContent />
      </AppShell>
    </ProtectedRoute>
  );
}
