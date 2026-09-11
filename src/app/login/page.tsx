"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/presentation/context/AuthContext";
import { TextInput } from "@/presentation/components/forms/TextInput";
import { Button } from "@/presentation/components/primitives/Button";
import { AlertBanner } from "@/presentation/components/feedback/AlertBanner";
import { StagingAccountHelper } from "@/presentation/components/auth/StagingAccountHelper";
import { sanitizeRedirect } from "@/presentation/utils/security";

/**
 * Maps raw authentication exceptions to calm, security-safe institutional microcopy.
 * Prevents account enumeration and technical jargon leaks (SEC-002, PRIV-001).
 */
export function mapAuthErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (
      msg.includes("invalid login credentials") ||
      msg.includes("invalid credentials") ||
      msg.includes("wrong password") ||
      msg.includes("email not confirmed") ||
      msg.includes("user not found")
    ) {
      return "Unable to sign in. Please check your credentials and try again.";
    }
    if (
      msg.includes("not configured") ||
      msg.includes("network") ||
      msg.includes("failed to fetch") ||
      msg.includes("timeout")
    ) {
      return "Unable to connect to authentication services. Please verify your network connection or contact IT support.";
    }
  }
  return "Unable to verify campus credentials. Please check your details and try again.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authState, signIn, error: authError } = useAuth();

  // Strictly initialized empty — zero hardcoded credentials, zero demo accounts
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to sanitized return URL or /dashboard
  useEffect(() => {
    if (authState === "AUTHENTICATED") {
      const redirectParam = searchParams.get("redirect");
      const targetUrl = sanitizeRedirect(redirectParam, "/dashboard");
      router.replace(targetUrl);
    }
  }, [authState, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setFormError("Please enter your institutional email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(trimmedEmail, password);
      const redirectParam = searchParams.get("redirect");
      const targetUrl = sanitizeRedirect(redirectParam, "/dashboard");
      router.push(targetUrl);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setFormError(mapAuthErrorMessage(err));
    }
  };

  const handleSelectStagingPersona = (stagingEmail: string, stagingPass: string) => {
    setEmail(stagingEmail);
    setPassword(stagingPass);
    setFormError(null);
  };

  const displayError = formError || (authError ? mapAuthErrorMessage(new Error(authError)) : null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-slate-200">
      {/* Institutional Top Navigation Bar */}
      <header className="w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xs py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--role-primary,#7FA8D9)] text-[var(--role-btn-text,#1E3A5F)] font-bold text-base shadow-xs ring-1 ring-black/5">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="font-semibold tracking-tight text-slate-900 text-base">Campus Plus</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-normal text-slate-500 border-l border-slate-200 pl-2">
                Official Grievance Resolution Portal
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
            <span className="hidden sm:inline">System Operational</span>
          </div>
        </div>
      </header>

      {/* Main Viewport Content: Two-Column Institutional Portal Layout */}
      <main className="flex-grow flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Institutional Mission, Governance & Trust Context */}
          <div className="lg:col-span-6 space-y-6 text-slate-900">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--role-accent,#EAF2FB)] text-[var(--role-btn-text,#1E3A5F)] border border-[var(--role-secondary,#B8D0EC)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--role-primary,#7FA8D9)]" aria-hidden="true"></span>
              Institutional Governance Architecture
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Accountable Campus Grievance Resolution
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                A centralized, role-governed platform connecting students, faculty, handlers, and institutional leadership for transparent grievance tracking and verified resolution.
              </p>
            </div>

            {/* Three Key Institutional Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                <div className="flex items-center space-x-2 text-[var(--role-btn-text,#1E3A5F)]">
                  <svg className="h-4 w-4 text-[var(--role-primary,#7FA8D9)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Role-Scoped Privacy</span>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Strict departmental boundaries and confidential handling ensure privacy for every complainant.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                <div className="flex items-center space-x-2 text-[var(--role-btn-text,#1E3A5F)]">
                  <svg className="h-4 w-4 text-[var(--role-primary,#7FA8D9)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Verifiable Closure</span>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Every resolution requires complainant verification before entering immutable closed state.
                </p>
              </div>
            </div>

            {/* Institutional Security Notice */}
            <div className="flex items-start space-x-3 p-3.5 rounded-lg bg-slate-100/80 border border-slate-200 text-xs text-slate-600">
              <svg className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="font-semibold text-slate-800">Authorized Campus Access Only.</span>
                <span className="block mt-0.5">
                  Sign in using your institutional email. All lifecycle actions are immutably logged for audit integrity.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Surface */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Institutional Sign In
                </h2>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Enter your verified campus credentials to access your grievance management portal.
                </p>
              </div>

              {displayError && (
                <AlertBanner variant="error" title="Authentication Notice">
                  {displayError}
                </AlertBanner>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <TextInput
                  id="campus-email"
                  type="email"
                  label="Institutional Email / Campus ID"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username@institution.edu"
                  disabled={isSubmitting}
                  helperText="Use your registered academic or administrative email address."
                />

                <div className="space-y-1.5">
                  <div className="relative">
                    <TextInput
                      id="campus-password"
                      type={showPassword ? "text" : "password"}
                      label="Password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      disabled={isSubmitting}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="pointer-events-auto p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-800 rounded cursor-pointer"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          tabIndex={0}
                        >
                          {showPassword ? (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      }
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full font-semibold shadow-xs hover:opacity-95 active:opacity-100 transition-opacity"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Sign In to Campus Plus
                  </Button>
                </div>
              </form>

              {/* Staging Demonstration Account Selector (Dev / Staging Only) */}
              <StagingAccountHelper
                onSelectPersona={handleSelectStagingPersona}
                disabled={isSubmitting}
              />

              {/* Help & IT Support Footer */}
              <div className="pt-4 border-t border-slate-100 text-center space-y-2">
                <p className="text-xs text-slate-500">
                  Having trouble signing in?
                </p>
                <p className="text-xs text-slate-400">
                  Contact your institutional IT department or grievance coordinator for credential assistance.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Institutional Legal & Audit Sub-Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white/70 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Campus Plus — Campus Complaint &amp; Grievance Resolution System</span>
          <span>Role-Based Access Control • Full Audit Immutability • WCAG 2.1 AA Compliant</span>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500" role="status">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading authentication portal...</span>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
