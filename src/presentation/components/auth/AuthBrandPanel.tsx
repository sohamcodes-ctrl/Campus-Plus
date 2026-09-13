"use client";

import React from "react";
import Image from "next/image";
import { PersonaConfig } from "./authTypes";

export interface AuthBrandPanelProps {
  selectedPersonaConfig: PersonaConfig;
}

export function AuthBrandPanel({ selectedPersonaConfig }: AuthBrandPanelProps) {
  const { palette, label } = selectedPersonaConfig;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 lg:p-10 shadow-sm space-y-8">
      {/* Background Graphic with soft institutional blend */}
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-full lg:w-3/5 overflow-hidden opacity-25"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent z-10" />
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

      {/* Header Badge */}
      <div className="relative z-20 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-200"
          style={{
            backgroundColor: palette.accent,
            borderColor: palette.secondary,
            color: palette.actionText,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: palette.primary }}
            aria-hidden="true"
          />
          <span>Campus Grievance Portal &bull; {label} Access</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Accountable Campus Grievance Resolution
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
            A unified, role-governed platform connecting students, faculty handlers, department heads, and executive administration for transparent grievance tracking and verified resolution.
          </p>
        </div>
      </div>

      {/* Three Key Institutional Guarantees */}
      <div className="relative z-20 grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-slate-800">
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Role-Scoped Privacy</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Strict departmental isolation and confidential handling ensure privacy for every grievance.
          </p>
        </div>

        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-slate-800">
            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Verifiable Closure</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Resolutions require complainant sign-off before entering immutable closed state.
          </p>
        </div>

        <div className="sm:col-span-2 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-slate-800">
            <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Tamper-Evident Audit</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Every status transition, assignment, forward, and verification is immutably logged with actor attribution.
          </p>
        </div>
      </div>

      {/* Institutional Security Notice */}
      <div className="relative z-20 flex items-start space-x-3 p-3.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-600">
        <svg className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <span className="font-semibold text-slate-800">Authorized Campus Access Only.</span>
          <span className="block mt-0.5 text-[11px] text-slate-500">
            Sign in with your verified institutional email. All lifecycle actions are immutably logged for audit integrity. Zero client-side privilege escalation is permitted under institutional security policy.
          </span>
        </div>
      </div>
    </div>
  );
}
