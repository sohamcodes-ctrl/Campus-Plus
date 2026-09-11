"use client";

import React, { useId } from "react";
import { cn } from "@/presentation/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id: customId,
      label,
      helperText,
      error,
      options,
      placeholder,
      required,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;

    const describedBy = [
      error ? errorId : null,
      helperText ? helperId : null,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative rounded-md shadow-xs">
          <select
            ref={ref}
            id={id}
            required={required}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy || undefined}
            className={cn(
              "block w-full appearance-none rounded-md border text-sm transition-colors py-2 pl-3 pr-10 text-slate-900 bg-white",
              "focus:outline-2 focus:outline-offset-1 focus:outline-[var(--role-primary,#7FA8D9)]",
              error
                ? "border-red-400 bg-red-50/20 text-red-900 focus:outline-red-500"
                : "border-slate-300 hover:border-slate-400",
              disabled && "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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
      </div>
    );
  }
);

Select.displayName = "Select";
