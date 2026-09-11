"use client";

import React from "react";
import { ProtectedRoute } from "@/presentation/components/auth/ProtectedRoute";
import { useAuth } from "@/presentation/context/AuthContext";
import { UserRole } from "@/domain/complaint";
import { StudentDashboard } from "@/presentation/components/dashboard/StudentDashboard";
import { HandlerDashboard } from "@/presentation/components/dashboard/HandlerDashboard";
import { HodDashboard } from "@/presentation/components/dashboard/HodDashboard";
import { ManagementDashboard } from "@/presentation/components/dashboard/ManagementDashboard";
import { AdminDashboard } from "@/presentation/components/dashboard/AdminDashboard";

function DashboardDispatcher() {
  const { role } = useAuth();

  switch (role) {
    case UserRole.ROLE_STUDENT:
    case UserRole.ROLE_FACULTY:
      return <StudentDashboard />;
    case UserRole.ROLE_HANDLER:
      return <HandlerDashboard />;
    case UserRole.ROLE_DEPT_HEAD:
      return <HodDashboard />;
    case UserRole.ROLE_MANAGEMENT:
      return <ManagementDashboard />;
    case UserRole.ROLE_ADMIN:
      return <AdminDashboard />;
    default:
      // Fallback to student view if role is resolving
      return <StudentDashboard />;
  }
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardDispatcher />
    </ProtectedRoute>
  );
}
