"use client";

import React from "react";
import { PersonaConfig } from "./authTypes";
import { cn } from "@/presentation/utils/cn";

export interface RoleOptionCardProps {
  config: PersonaConfig;
  isSelected: boolean;
  onSelect: (id: PersonaConfig["id"]) => void;
}

function renderPersonaIcon(id: PersonaConfig["id"]) {
  switch (id) {
    case "student":
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
        </svg>
      );
    case "handler":
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "hod":
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case "director":
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      );
    case "management":
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
  }
}

export function RoleOptionCard({ config, isSelected, onSelect }: RoleOptionCardProps) {
  const { id, label, shortDescription, palette } = config;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(id)}
      style={
        isSelected
          ? {
              backgroundColor: palette.accent,
              borderColor: palette.primary,
              color: palette.text,
            }
          : undefined
      }
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-xl border p-2.5 sm:p-3 text-left transition-all duration-150 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 select-none",
        isSelected
          ? "border-2 shadow-xs"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-700"
      )}
    >
      {/* Icon Container with Persona Accent */}
      <div
        style={
          isSelected
            ? {
                backgroundColor: palette.primary,
                color: "#FFFFFF",
              }
            : undefined
        }
        className={cn(
          "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
          isSelected
            ? "shadow-2xs"
            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700"
        )}
      >
        {renderPersonaIcon(id)}
      </div>

      {/* Label and Subtitle */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <p
            className={cn(
              "text-xs sm:text-sm font-bold leading-snug",
              isSelected ? "text-slate-900" : "text-slate-800"
            )}
          >
            {label}
          </p>
          {isSelected && (
            <span
              style={{ color: palette.actionText }}
              className="inline-flex h-4 w-4 shrink-0 items-center justify-center ml-1"
              aria-hidden="true"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </div>
        <p className="text-[11px] sm:text-xs text-slate-500 leading-normal pt-0.5">
          {shortDescription}
        </p>
      </div>
    </button>
  );
}
