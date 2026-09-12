"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/presentation/context/AuthContext";
import { ShellLoading } from "@/presentation/components/shell/ShellLoading";
import { ShellError } from "@/presentation/components/shell/ShellError";
import { ForbiddenState } from "@/presentation/components/shell/ForbiddenState";
import { AppShell } from "@/presentation/components/shell/AppShell";

// Modular Landing Components matching Authoritative Reference Specification
import { LandingHeader } from "@/presentation/components/landing/LandingHeader";
import { HeroSection } from "@/presentation/components/landing/HeroSection";
import { MetricsBar } from "@/presentation/components/landing/MetricsBar";
import { HowItWorks } from "@/presentation/components/landing/HowItWorks";
import { RoleEcosystem } from "@/presentation/components/landing/RoleEcosystem";
import { LandingFooter } from "@/presentation/components/landing/LandingFooter";

/**
 * Root Application Public Landing Page ("/")
 *
 * Faithfully reproduces the authoritative visual reference specification:
 * - Institutional Header (Brand shield, wordmark, tagline, navigation, CTAs)
 * - Hero Section (Two-line bold headline, supporting text, dual CTAs, institutional building visual)
 * - Trust Strip (4 items: Secure Access, Real-time Tracking, Transparency, Accountability)
 * - Metrics Bar (Floating white card: 2,482 Registered, 1,842 Resolved, 98% In Time, 100% Confidentiality)
 * - How It Works (5 horizontal process steps with circular icons and connecting arrows)
 * - Who Can Use Campus Plus (6 role cards: Students, Handlers, HODs, Directors, Management, Admins)
 * - Institutional Footer (Deep navy background, support email, emergency instructions, copyright)
 *
 * Preserves all functional authentication behaviors:
 * - Unauthenticated visitors view the public institutional landing page with links to href="/login" and href="/register".
 * - Authenticated users automatically redirect to /dashboard via router.replace("/dashboard").
 * - In-flight loading / session initialization displays accessible ShellLoading.
 * - Forbidden identity renders ForbiddenState inside AppShell.
 * - Identity verification failures render ShellError with retry action.
 */
export default function RootPage() {
  const router = useRouter();
  const { authState, error, refreshActor } = useAuth();

  useEffect(() => {
    if (authState === "AUTHENTICATED") {
      router.replace("/dashboard");
    }
  }, [authState, router]);

  // Transitional loading states and authenticated dashboard transition
  if (
    authState === "UNKNOWN" ||
    authState === "INITIALIZING" ||
    authState === "AUTHENTICATING" ||
    authState === "AUTHENTICATED_PENDING_ACTOR" ||
    authState === "SIGNING_OUT" ||
    authState === "AUTHENTICATED"
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

  // Render Pixel-Accurate Public Landing Page for Unauthenticated Visitors
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Header Navigation */}
      <LandingHeader />

      <main id="main-content" className="flex-1 focus:outline-hidden">
        {/* Hero Section with Left Content, Dual CTAs, Campus Building Visual, and Trust Strip */}
        <HeroSection />

        {/* Floating Metrics Bar overlapping Hero and Process */}
        <MetricsBar />

        {/* 5-Step Process */}
        <HowItWorks />

        {/* 6-Card Role Ecosystem */}
        <RoleEcosystem />
      </main>

      {/* Institutional Dark Navy Footer */}
      <LandingFooter />
    </div>
  );
}
