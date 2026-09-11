"use client";

import React, { useId } from "react";
import { cn } from "@/presentation/utils/cn";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  label?: string;
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  helperText,
  required,
  orientation = "vertical",
  className,
}) => {
  const groupId = useId();
  const errorId = `${groupId}-error`;
  const helperId = `${groupId}-helper`;

  return (
    <fieldset
      className={cn("w-full space-y-2", className)}
      aria-describedby={error ? errorId : helperText ? helperId : undefined}
    >
      {label && (
        <legend className="text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </legend>
      )}

      <div
        className={cn(
          "gap-2",
          orientation === "horizontal"
            ? "flex flex-wrap items-center"
            : "flex flex-col space-y-1.5"
        )}
      >
        {options.map((opt) => {
          const isChecked = value === opt.value;
          const inputId = `${name}-${opt.value}`;

          return (
            <label
              key={opt.value}
              htmlFor={inputId}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors select-none",
                isChecked
                  ? "border-[var(--role-primary,#7FA8D9)] bg-[var(--role-accent,#EAF2FB)]/30"
                  : "border-slate-200 bg-white hover:bg-slate-50",
                opt.disabled && "opacity-50 cursor-not-allowed bg-slate-50"
              )}
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                value={opt.value}
                checked={isChecked}
                disabled={opt.disabled}
                onChange={() => onChange?.(opt.value)}
                className="mt-0.5 h-4 w-4 text-[var(--role-primary,#7FA8D9)] border-slate-300 focus:ring-2 focus:ring-[var(--role-primary,#7FA8D9)] cursor-pointer"
              />
              <div className="text-sm">
                <span className="font-medium text-slate-900 block">{opt.label}</span>
                {opt.description && (
                  <span className="text-xs text-slate-500 block mt-0.5">{opt.description}</span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={helperId} className="text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </fieldset>
  );
};
