"use client";

import React, { useState, Suspense } from "react";
import { CampusPlusAuthShell } from "@/presentation/components/auth/CampusPlusAuthShell";
import { AuthBrandPanel } from "@/presentation/components/auth/AuthBrandPanel";
import { SignInForm, mapAuthErrorMessage } from "@/presentation/components/auth/SignInForm";
import { PersonaId, PERSONA_CONFIGS } from "@/presentation/components/auth/authTypes";

export { mapAuthErrorMessage };

export function LoginForm() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>("student");

  // Kept here for explicit unit-level testing compatibility
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  void email;
  void setEmail;
  void password;
  void setPassword;

  const currentConfig = PERSONA_CONFIGS[selectedPersona];

  return (
    <CampusPlusAuthShell currentPersona={currentConfig} mode="login">
      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center"
        style={
          {
            "--persona-primary": currentConfig.palette.primary,
            "--persona-secondary": currentConfig.palette.secondary,
            "--persona-accent": currentConfig.palette.accent,
            "--persona-action-text": currentConfig.palette.actionText,
          } as React.CSSProperties
        }
      >
        {/* Left Column: Institutional Brand & Security Guarantees */}
        <div className="lg:col-span-6 hidden lg:block">
          <AuthBrandPanel selectedPersonaConfig={currentConfig} />
        </div>

        {/* Right Column: Interactive 5-Persona Sign-In Panel */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <SignInForm
            selectedPersona={selectedPersona}
            onSelectPersona={setSelectedPersona}
          />
        </div>
      </div>
    </CampusPlusAuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-500">
          <div className="flex items-center space-x-2">
            <svg
              className="animate-spin h-5 w-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-xs font-semibold">Loading Campus Plus Authentication...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
