"use client";

import React, { useState } from "react";
import { PersonaId, PERSONA_CONFIGS } from "@/presentation/components/auth/authTypes";
import { RegistrationFlow } from "@/presentation/components/auth/RegistrationFlow";
import { CampusPlusAuthShell } from "@/presentation/components/auth/CampusPlusAuthShell";

export default function RegisterPage() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>("student");

  const currentConfig = PERSONA_CONFIGS[selectedPersona];
  const { palette } = currentConfig;

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
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Campus Plus Institutional Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Campus Plus enforces strict role-based access control. All campus accounts are partitioned into five operational personas: Student, Faculty / Staff / HOD, Director, and Institutional Management.
            </p>
          </div>

          {/* Persona Switcher Quick Hints */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Persona Directory
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                5 Roles
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-lg bg-slate-50 flex items-center justify-between">
                <span className="font-semibold text-slate-800">Student / Complainant</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">Self-Service Intake</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 flex items-center justify-between">
                <span className="font-semibold text-slate-800">Faculty / Staff / HOD</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">Registrar Provisioned</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 flex items-center justify-between">
                <span className="font-semibold text-slate-800">Director / Senior Authority</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">Directorate Issued</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 flex items-center justify-between">
                <span className="font-semibold text-slate-800">Institutional Management</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-medium">Board Authorized</span>
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
