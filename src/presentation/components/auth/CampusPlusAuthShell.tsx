"use client";

import React from "react";
import Link from "next/link";
import { PersonaConfig } from "./authTypes";
import { AuthFooter } from "./AuthFooter";

export interface CampusPlusAuthShellProps {
  currentPersona: PersonaConfig;
  mode: "login" | "register";
  children: React.ReactNode;
}

export function CampusPlusAuthShell({
  currentPersona,
  mode,
  children,
}: CampusPlusAuthShellProps) {
  const { palette } = currentPersona;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-slate-200">
      {/* 3px Persona Accent Bar at Top */}
      <div
        className="h-[3px] w-full transition-colors duration-200"
        style={{ backgroundColor: palette.primary }}
        aria-hidden="true"
      />

      {/* Institutional Top Navigation Bar */}
      <header className="w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xs py-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo & Monogram */}
          <Link
            href="/"
            className="flex items-center space-x-3 focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg"
          >
            <div
              style={{
                backgroundColor: palette.primary,
                color: palette.actionText,
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg font-black text-xs shadow-xs ring-1 ring-black/5 select-none transition-colors duration-200"
            >
              C+
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-slate-900 text-sm leading-tight">
                Campus Plus
              </span>
              <span className="text-[10px] text-slate-400 font-normal leading-none hidden sm:inline-block">
                Campus Complaint & Grievance Resolution System
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-3 text-xs">
            <span className="hidden md:inline text-xs text-slate-500 font-medium">
              Official Grievance Resolution Portal
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
            >
              <span>&larr;</span>
              <span>Home</span>
            </Link>
            <span className="text-slate-300">|</span>
            {mode === "login" ? (
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Create Account
              </Link>
            ) : (
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Sign In
              </Link>
            )}
            <span className="hidden sm:inline text-slate-300">|</span>
            <div className="hidden sm:flex items-center space-x-1.5 text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              <span>System Operational</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="flex-grow flex items-center justify-center py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">{children}</div>
      </main>

      {/* Institutional Minimal Footer */}
      <AuthFooter />
    </div>
  );
}
