"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthContext } from "@/presentation/context/AuthContext";
import { PersonaId, PERSONA_CONFIGS } from "@/presentation/components/auth/authTypes";
import { RegistrationFlow } from "@/presentation/components/auth/RegistrationFlow";
import { CampusPlusAuthShell } from "@/presentation/components/auth/CampusPlusAuthShell";
import { formatRoleLabel } from "@/presentation/navigation/navigationConfig";

export default function RegisterPage() {
  const auth = React.useContext(AuthContext);
  const authState = auth?.authState ?? "UNAUTHENTICATED";
  const actor = auth?.actor ?? null;
  const signOut = auth?.signOut;
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>("student");

  const currentConfig = PERSONA_CONFIGS[selectedPersona];
  const { palette } = currentConfig;

  // Authenticated guard: prevent logged-in users from self-escalating via registration
  if (authState === "AUTHENTICATED" && actor) {
    const roleLabel = formatRoleLabel(actor.role);
    const userEmail = auth?.user?.email || "Authorized Personnel";
    return (
      <CampusPlusAuthShell currentPersona={currentConfig} mode="register">
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 lg:p-10 space-y-6 text-left">
          <div className="space-y-1 border-b border-slate-100 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Institutional Session
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Already Signed In
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              You are currently signed in as <strong className="text-slate-800">{userEmail}</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Verified Technical Role:</span>
              <span className="font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                {roleLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Campus Plus enforces server-authoritative role binding. Registration cannot be used to self-escalate privileges or alter your existing institutional assignment.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors text-center"
            >
              Continue to {roleLabel} Dashboard &rarr;
            </Link>
            <button
              type="button"
              onClick={() => signOut?.()}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-center cursor-pointer"
            >
              Sign Out from this Device
            </button>
          </div>
        </div>
      </CampusPlusAuthShell>
    );
  }

  return (
    <CampusPlusAuthShell currentPersona={currentConfig} mode="register">
      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start"
        style={
          {
            "--persona-primary": palette.primary,
            "--persona-secondary": palette.secondary,
            "--persona-accent": palette.accent,
            "--persona-action-text": palette.actionText,
          } as React.CSSProperties
        }
      >
        {/* Left Column: Context, Security & Institutional IAM Compliance */}
        <div className="lg:col-span-5 space-y-6 text-slate-900">
          <div
            style={{
              backgroundColor: palette.accent,
              borderColor: palette.secondary,
              color: palette.actionText,
            }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-200"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: palette.primary }}
              aria-hidden="true"
            />
            <span>Account Enrollment &amp; Provisioning</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight break-words">
              Campus Plus Institutional Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Campus Plus enforces strict role-based access control across five distinct operational personas: Student, Faculty / Handler, HOD, Director / Senior Authority, and Institutional Management.
            </p>
          </div>

          {/* Persona Switcher Quick Hints */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider">
                Persona Directory (5 Roles)
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Faculty / Staff / HOD Policy
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-lg bg-slate-50 flex items-center justify-between gap-1.5">
                <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">Student / Complainant</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium shrink-0">Self-Service Intake</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 flex items-center justify-between gap-1.5">
                <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">Faculty / Handler</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 font-medium shrink-0">Registrar Provisioned</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 flex items-center justify-between gap-1.5">
                <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">HOD</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium shrink-0">Dean Appointed</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 flex items-center justify-between gap-1.5">
                <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">Director / Senior Authority</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium shrink-0">Directorate Issued</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 flex items-center justify-between gap-1.5">
                <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">Institutional Management</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-medium shrink-0">Board Authorized</span>
              </div>
            </div>
          </div>

          {/* IAM Compliance Notice */}
          <div className="rounded-2xl border border-slate-200 bg-slate-100/80 p-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center space-x-2 text-slate-800 font-bold">
              <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Identity &amp; Access Governance</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Institutional IAM Compliance prevents unauthorized privilege elevation. Only verified campus credentials can access administrative and grievance resolution workspaces.
            </p>
          </div>
        </div>

        {/* Right Column: Registration Flow */}
        <div className="lg:col-span-7 w-full max-w-lg mx-auto">
          <RegistrationFlow
            initialPersona={selectedPersona}
            onPersonaChange={setSelectedPersona}
          />
        </div>
      </div>
    </CampusPlusAuthShell>
  );
}
