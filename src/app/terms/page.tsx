"use client";

import React from "react";
import Link from "next/link";
import { CampusPlusAuthShell } from "@/presentation/components/auth/CampusPlusAuthShell";
import { PERSONA_CONFIGS } from "@/presentation/components/auth/authTypes";
import { Card } from "@/presentation/components/primitives/Card";

export default function TermsPage() {
  const studentConfig = PERSONA_CONFIGS.student;

  return (
    <CampusPlusAuthShell currentPersona={studentConfig} mode="login">
      <div className="max-w-4xl mx-auto space-y-8 text-left">
        {/* Header */}
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
            <span>Institutional Charter &bull; Terms of Governance</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Terms of Institutional Governance
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Campus Plus is the authoritative grievance resolution and operational oversight platform for campus administration, faculty, staff, and students.
          </p>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          <Card
            title="1. Scope of Acceptable Use &amp; Complainant Integrity"
            description="Guidelines for authentic grievance reporting and campus civility."
          >
            <p className="text-xs text-slate-600 leading-relaxed pt-2">
              Campus Plus is provided exclusively for legitimate institutional grievances, facility maintenance reports, academic evaluation inquiries, and campus welfare matters. Submitting fabricated, malicious, defamatory, or abusive reports is strictly prohibited and constitutes a violation of campus disciplinary codes. All submissions are tied to verified institutional accounts and are subject to administrative review.
            </p>
          </Card>

          <Card
            title="2. Immutable Audit Ledger &amp; Accountability (BR-020)"
            description="Tamper-evident recording of lifecycle actions."
          >
            <p className="text-xs text-slate-600 leading-relaxed pt-2">
              All interactions within Campus Plus—including complaint intake, assignment to departmental handlers, status transitions, progress updates, forwarding justifications, and resolution attestations—are permanently inscribed in an immutable, cryptographically verifiable audit log. Neither administrators nor complainants may retroactively alter closed audit events.
            </p>
          </Card>

          <Card
            title="3. Departmental Jurisdiction &amp; Service Level Agreements"
            description="Standard operational commitments for complaint resolution."
          >
            <p className="text-xs text-slate-600 leading-relaxed pt-2">
              Complaints are routed to responsible department handlers in accordance with institutional jurisdiction. Departments are held accountable to published Service Level Agreements (SLAs). If an assigned complaint is not resolved within prescribed SLA thresholds, it is systematically escalated to the Department Head (Tier 2) and institutional Management (Tier 3) to prevent deadlocks and ensure prompt redress.
            </p>
          </Card>

          <Card
            title="4. Complainant Verification &amp; Right of Dispute (BR-016, BR-018)"
            description="Student empowerment and verification safeguards."
          >
            <p className="text-xs text-slate-600 leading-relaxed pt-2">
              When a grievance is marked as resolved by an assigned handler, the original complainant retains the right to verify the physical resolution or dispute the closure within a 5-business-day window. Disputing a resolution reopens the grievance for managerial review, ensuring that issues are solved in substance rather than solely on paper.
            </p>
          </Card>

          <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-800 transition-colors">
              &larr; Return to Campus Plus
            </Link>
            <Link href="/privacy" className="font-semibold text-blue-600 hover:underline">
              Institutional Privacy Charter &rarr;
            </Link>
          </div>
        </div>
      </div>
    </CampusPlusAuthShell>
  );
}
