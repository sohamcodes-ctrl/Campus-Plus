"use client";

import React from "react";
import Link from "next/link";
import { CampusPlusAuthShell } from "@/presentation/components/auth/CampusPlusAuthShell";
import { PERSONA_CONFIGS } from "@/presentation/components/auth/authTypes";
import { Card } from "@/presentation/components/primitives/Card";

export default function PrivacyPage() {
  const studentConfig = PERSONA_CONFIGS.student;

  return (
    <CampusPlusAuthShell currentPersona={studentConfig} mode="login">
      <div className="max-w-4xl mx-auto space-y-8 text-left">
        {/* Header */}
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
            <span>Institutional Charter &bull; Privacy &amp; Data Security</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Institutional Privacy Charter
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Campus Plus is governed by strict role-scoped confidentiality, audit ledger immutability, and complainant data protections under campus policy.
          </p>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          <Card
            title="1. Role-Scoped Privacy &amp; Data Isolation (PRIV-001)"
            description="Strict technical isolation of student grievances."
          >
            <p className="text-xs text-slate-600 leading-relaxed pt-2">
              Every complaint submitted to Campus Plus is protected by database-level Row Level Security (RLS). Complainants can view only grievances submitted under their verified account. Handlers and Department Heads access only grievances assigned to their specific departmental jurisdiction. Cross-departmental snooping and peer-to-peer complaint visibility are blocked at the database engine level.
            </p>
          </Card>

          <Card
            title="2. Internal Staff Notes &amp; Confidential Investigations (INV-012)"
            description="Protection of internal deliberations and technical notes."
          >
            <p className="text-xs text-slate-600 leading-relaxed pt-2">
              Internal investigatory notes, handler handover memorandums, and technical triage remarks are classified as staff-confidential. They are excluded from public timeline endpoints and are never visible to students or unauthorized external entities.
            </p>
          </Card>

          <Card
            title="3. Tamper-Evident Audit Ledger (BR-020)"
            description="Immutable recording of all operational lifecycle transitions."
          >
            <p className="text-xs text-slate-600 leading-relaxed pt-2">
              All state transitions, handler assignments, forwarding rationales, and resolution sign-offs are immutably logged to an append-only audit ledger with cryptographic timestamps and verified actor attribution. Records cannot be deleted or rewritten.
            </p>
          </Card>

          <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-800 transition-colors">
              &larr; Return to Campus Plus
            </Link>
            <Link href="/terms" className="font-semibold text-blue-600 hover:underline">
              Terms of Institutional Governance &rarr;
            </Link>
          </div>
        </div>
      </div>
    </CampusPlusAuthShell>
  );
}
