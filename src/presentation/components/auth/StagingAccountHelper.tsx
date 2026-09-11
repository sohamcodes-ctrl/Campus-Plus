"use client";

import React from "react";

export interface StagingPersona {
  roleName: string;
  label: string;
  email: string;
  password: string;
  badgeColor: string;
}

export const STAGING_PERSONAS: StagingPersona[] = [
  {
    roleName: "STUDENT",
    label: "Student",
    email: "student.a@synthetic.campusplus.internal",
    password: "CampusPlus2026!",
    badgeColor: "bg-[#7FA8D9]/20 text-[#1E3A5F] border-[#7FA8D9]/50 hover:bg-[#7FA8D9]/30",
  },
  {
    roleName: "HANDLER",
    label: "Handler",
    email: "handler.it1@synthetic.campusplus.internal",
    password: "CampusPlus2026!",
    badgeColor: "bg-[#7FC4B2]/20 text-[#1A3830] border-[#7FC4B2]/50 hover:bg-[#7FC4B2]/30",
  },
  {
    roleName: "HOD",
    label: "HOD",
    email: "hod.it@synthetic.campusplus.internal",
    password: "CampusPlus2026!",
    badgeColor: "bg-[#B39DDB]/20 text-[#2B1E40] border-[#B39DDB]/50 hover:bg-[#B39DDB]/30",
  },
  {
    roleName: "MANAGEMENT",
    label: "Management",
    email: "management@synthetic.campusplus.internal",
    password: "CampusPlus2026!",
    badgeColor: "bg-[#E3A6AE]/20 text-[#3D1C22] border-[#E3A6AE]/50 hover:bg-[#E3A6AE]/30",
  },
  {
    roleName: "ADMIN",
    label: "System Admin",
    email: "sysadmin@synthetic.campusplus.internal",
    password: "CampusPlus2026!",
    badgeColor: "bg-[#9FB4C7]/20 text-[#1C2B38] border-[#9FB4C7]/50 hover:bg-[#9FB4C7]/30",
  },
];

export interface StagingAccountHelperProps {
  onSelectPersona: (email: string, password: string) => void;
  disabled?: boolean;
}

export function StagingAccountHelper({ onSelectPersona, disabled }: StagingAccountHelperProps) {
  const isEnabled =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ENABLE_STAGING_PRESETS === "true";

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="mt-6 pt-6 border-t border-dashed border-slate-200" aria-label="Staging Demonstration Access">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Development / Staging
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
          Environment: STAGING
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        Click a persona to populate authentic Supabase credentials for evaluation:
      </p>
      <div className="flex flex-wrap gap-2">
        {STAGING_PERSONAS.map((persona) => (
          <button
            key={persona.roleName}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPersona(persona.email, persona.password)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer hover:shadow-xs focus:outline-2 focus:outline-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${persona.badgeColor}`}
          >
            [ {persona.label} ]
          </button>
        ))}
      </div>
    </div>
  );
}
