"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/presentation/context/AuthContext";
import { UserRoleType } from "@/domain/complaint";
import { AppShell } from "@/presentation/components/shell/AppShell";
import { ShellLoading } from "@/presentation/components/shell/ShellLoading";
import { ForbiddenState } from "@/presentation/components/shell/ForbiddenState";
import { ShellError } from "@/presentation/components/shell/ShellError";
import { isValidInternalRedirect } from "@/presentation/utils/security";

export interface ProtectedRouteProps {
  allowedRoles?: UserRoleType[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { authState, role, error, refreshActor } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authState === "UNAUTHENTICATED") {
      const redirectParam = isValidInternalRedirect(pathname)
        ? `?redirect=${encodeURIComponent(pathname)}`
        : "";
      router.replace(`/login${redirectParam}`);
    }
  }, [authState, router, pathname]);

  // Loading state
  if (
    authState === "INITIALIZING" ||
    authState === "AUTHENTICATING" ||
    authState === "AUTHENTICATED_PENDING_ACTOR" ||
    authState === "SIGNING_OUT"
  ) {
    return <ShellLoading />;
  }

  // Unauthenticated: return empty shell while redirect takes effect
  if (authState === "UNAUTHENTICATED") {
    return <ShellLoading />;
  }

  // System error
  if (authState === "ERROR") {
    return <ShellError error={error} onRetry={refreshActor} />;
  }

  // Forbidden: either authState is FORBIDDEN or user's role is not in allowedRoles
  if (authState === "FORBIDDEN" || (allowedRoles && role && !allowedRoles.includes(role))) {
    return (
      <AppShell>
        <ForbiddenState />
      </AppShell>
    );
  }

  // Authenticated and authorized
  return <AppShell>{children}</AppShell>;
};
