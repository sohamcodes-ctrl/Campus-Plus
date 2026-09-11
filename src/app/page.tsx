"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/presentation/context/AuthContext";
import { ShellLoading } from "@/presentation/components/shell/ShellLoading";
import { ShellError } from "@/presentation/components/shell/ShellError";
import { ForbiddenState } from "@/presentation/components/shell/ForbiddenState";
import { AppShell } from "@/presentation/components/shell/AppShell";

/**
 * Root Application Entry Point ("/")
 *
 * Resolves application entry authoritatively based on the 9-state authentication FSM:
 * - Authenticated -> Replaces route with /dashboard
 * - Unauthenticated -> Replaces route with /login
 * - In-flight / Loading -> Displays accessible ShellLoading
 * - Identity Forbidden -> Displays ForbiddenState inside AppShell
 * - Verification Error -> Displays ShellError with retry action
 *
 * Replaces the legacy prototype scaffold.
 * Zero exposure of internal diagnostics, phase labels, or mock data.
 */
export default function RootPage() {
  const router = useRouter();
  const { authState, error, refreshActor } = useAuth();

  useEffect(() => {
    if (authState === "AUTHENTICATED") {
      router.replace("/dashboard");
    } else if (authState === "UNAUTHENTICATED") {
      router.replace("/login");
    }
  }, [authState, router]);

  // Loading, initializing, or transitional states
  if (
    authState === "UNKNOWN" ||
    authState === "INITIALIZING" ||
    authState === "AUTHENTICATING" ||
    authState === "AUTHENTICATED_PENDING_ACTOR" ||
    authState === "SIGNING_OUT" ||
    authState === "AUTHENTICATED" ||
    authState === "UNAUTHENTICATED"
  ) {
    return <ShellLoading />;
  }

  // Account authenticated in Supabase but lacks active campus role / 403
  if (authState === "FORBIDDEN") {
    return (
      <AppShell>
        <ForbiddenState />
      </AppShell>
    );
  }

  // Identity verification network or system failure
  if (authState === "ERROR") {
    return <ShellError error={error} onRetry={refreshActor} />;
  }

  return <ShellLoading />;
}

