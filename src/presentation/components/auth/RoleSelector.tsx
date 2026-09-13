"use client";

import React from "react";
import { PersonaId, PERSONA_CONFIGS, ALL_PERSONA_IDS } from "./authTypes";
import { RoleOptionCard } from "./RoleOptionCard";

export interface RoleSelectorProps {
  selectedPersona: PersonaId;
  onSelectPersona: (persona: PersonaId) => void;
  label?: string;
  helperText?: string;
}

export function RoleSelector({
  selectedPersona,
  onSelectPersona,
  label = "Account Type",
  helperText = "Select your campus portal access type:",
}: RoleSelectorProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = ALL_PERSONA_IDS.indexOf(selectedPersona);
    if (currentIndex === -1) return;

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % ALL_PERSONA_IDS.length;
      onSelectPersona(ALL_PERSONA_IDS[nextIndex]);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + ALL_PERSONA_IDS.length) % ALL_PERSONA_IDS.length;
      onSelectPersona(ALL_PERSONA_IDS[prevIndex]);
    } else if (e.key === "Home") {
      e.preventDefault();
      onSelectPersona(ALL_PERSONA_IDS[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      onSelectPersona(ALL_PERSONA_IDS[ALL_PERSONA_IDS.length - 1]);
    }
  };

  return (
    <div className="space-y-2 text-left">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
        <span className="text-[11px] text-slate-400">
          {PERSONA_CONFIGS[selectedPersona]?.label}
        </span>
      </div>
      {helperText && (
        <p className="text-[11px] text-slate-500 leading-tight">
          {helperText}
        </p>
      )}

      <div
        role="radiogroup"
        aria-label="Account Type Selection"
        onKeyDown={handleKeyDown}
        className="flex flex-col gap-2 pt-1"
      >
        {ALL_PERSONA_IDS.map((id) => (
          <RoleOptionCard
            key={id}
            config={PERSONA_CONFIGS[id]}
            isSelected={selectedPersona === id}
            onSelect={onSelectPersona}
          />
        ))}
      </div>
    </div>
  );
}
