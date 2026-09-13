"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PersonaId, PERSONA_CONFIGS, ALL_PERSONA_IDS } from "./authTypes";
import { StudentRegistrationForm } from "./StudentRegistrationForm";
import { PrivilegedRoleProvisioningNotice } from "./PrivilegedRoleProvisioningNotice";
import { cn } from "@/presentation/utils/cn";

export interface RegistrationFlowProps {
  initialPersona?: PersonaId;
  onPersonaChange?: (persona: PersonaId) => void;
}

export function RegistrationFlow({
  initialPersona = "student",
  onPersonaChange,
}: RegistrationFlowProps) {
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>(initialPersona);
  const [step, setStep] = useState<"SELECT_ROLE" | "FORM">("FORM");

  const handleSelectPersona = (id: PersonaId) => {
    setSelectedPersona(id);
    onPersonaChange?.(id);
    setStep("FORM");
  };

  const handleBackToSelect = () => {
    setStep("SELECT_ROLE");
  };

  const currentConfig = PERSONA_CONFIGS[selectedPersona];

  if (step === "SELECT_ROLE") {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 lg:p-10 space-y-6 text-left">
        {/* Header */}
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Account Enrollment
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Create your Campus Plus account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Choose your account type to get started.
          </p>
        </div>

        {/* 5 Persona Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1" role="list">
          {ALL_PERSONA_IDS.map((id, index) => {
            const config = PERSONA_CONFIGS[id];
            const isFifth = index === 4;

            return (
              <div key={id} className={isFifth ? "sm:col-span-2" : undefined}>
                <button
                  type="button"
                  onClick={() => handleSelectPersona(id)}
                  style={{
                    borderColor: config.palette.secondary,
                  }}
                  className={cn(
                    "w-full flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-150 hover:shadow-sm group cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 select-none",
                    "hover:border-slate-400 bg-white"
                  )}
                >
                  <div
                    style={{
                      backgroundColor: config.palette.accent,
                      color: config.palette.actionText,
                    }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors group-hover:scale-105"
                  >
                    <span className="font-bold text-sm">
                      {config.label.charAt(0)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {config.label}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {config.badgeLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-normal">
                      {config.shortDescription}
                    </p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span>Already registered? </span>
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              Sign In &rarr;
            </Link>
          </div>
          <Link href="/" className="hover:text-slate-800 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Step 2: Form or Privileged Notice
  if (selectedPersona === "student") {
    return (
      <StudentRegistrationForm
        personaConfig={currentConfig}
        onChangeRole={handleBackToSelect}
      />
    );
  }

  return (
    <PrivilegedRoleProvisioningNotice
      personaConfig={currentConfig}
      onChangeRole={handleBackToSelect}
    />
  );
}
