"use client";

import React from "react";
import Link from "next/link";
import { CampusPlusAuthShell } from "@/presentation/components/auth/CampusPlusAuthShell";
import { PERSONA_CONFIGS } from "@/presentation/components/auth/authTypes";
import { Card } from "@/presentation/components/primitives/Card";

export default function HelpPage() {
  const studentConfig = PERSONA_CONFIGS.student;

  return (
    <CampusPlusAuthShell currentPersona={studentConfig} mode="login">
      <div className="max-w-4xl mx-auto space-y-8 text-left">
        {/* Header */}
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
            <span>Institutional Assistance &bull; Campus Plus</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Help &amp; Institutional Support
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Assistance with grievance submissions, authentication recovery, account provisioning, and departmental resolution workflows.
          </p>
        </div>

        {/* Support Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Account & Password Recovery */}
          <Card
            title="Account Access &amp; Password Recovery"
            description="Assistance with signing in or resetting your campus credentials."
          >
            <div className="space-y-3 pt-2 text-xs text-slate-600 leading-relaxed">
              <p>
                Campus Plus accounts are linked directly to your institutional email. Password resets and multi-factor authentications are managed by the campus IT Department.
              </p>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1">
                <span className="font-bold text-slate-800">IT Department Helpdesk</span>
                <p className="text-slate-500">Email: it-support@campusplus.internal</p>
                <p className="text-slate-500">Location: Administrative Block, Ground Floor, Room 12</p>
                <p className="text-slate-500">Hours: Monday – Friday, 09:00 – 17:00</p>
              </div>
            </div>
          </Card>

          {/* Card 2: Grievance Lifecycle Guide */}
          <Card
            title="Grievance Lifecycle &amp; SLA Guide"
            description="Understanding complaint stages from submission to closure."
          >
            <div className="space-y-2 pt-2 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-700">1. Submission:</span>
                <span>Complainant files grievance with tracking code (CP-YYYY-XXXXX).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-purple-700">2. Triage &amp; Assign:</span>
                <span>Department Head reviews scope and dispatches assigned handler.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-emerald-700">3. Investigation:</span>
                <span>Handler logs progress, actions repairs, and submits resolution proof.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900">4. Verification:</span>
                <span>Complainant reviews resolution before ticket reaches immutable closure.</span>
              </div>
            </div>
          </Card>

          {/* Card 3: Frequently Asked Questions */}
          <Card
            title="Frequently Asked Questions"
            description="Common inquiries regarding confidentiality and tracking."
          >
            <div className="space-y-3 pt-2 text-xs text-slate-600 leading-relaxed">
              <div>
                <span className="font-bold text-slate-800">Can other students see my complaint?</span>
                <p className="mt-0.5 text-slate-500">
                  No. Under Rule PRIV-001, grievances are strictly confidential between the complainant, assigned handler, and department head.
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-800">What if a complaint is not resolved in time?</span>
                <p className="mt-0.5 text-slate-500">
                  Complaints exceeding SLA thresholds are automatically elevated to Tier 2 (Department Head) and Tier 3 (Management) escalations.
                </p>
              </div>
            </div>
          </Card>

          {/* Card 4: Quick Navigation & Return */}
          <Card
            title="Quick Navigation"
            description="Return to key areas of Campus Plus."
          >
            <div className="space-y-2.5 pt-2 text-xs">
              <Link
                href="/login"
                className="block p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-800 transition-colors"
              >
                &rarr; Sign In to Your Campus Plus Account
              </Link>
              <Link
                href="/register"
                className="block p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-800 transition-colors"
              >
                &rarr; Student Enrollment &amp; Staff Provisioning
              </Link>
              <Link
                href="/"
                className="block p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-800 transition-colors"
              >
                &larr; Return to Campus Plus Home
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </CampusPlusAuthShell>
  );
}
