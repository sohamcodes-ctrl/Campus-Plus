"use client";

import React, { useId } from "react";
import { cn } from "@/presentation/utils/cn";

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      id: customId,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      required,
      disabled,
      className,
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
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            required={required}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy || undefined}
            className={cn(
              "block w-full rounded-md border text-sm transition-colors py-2 px-3 text-slate-900 placeholder:text-slate-400",
              "focus:outline-2 focus:outline-offset-1 focus:outline-[var(--role-primary,#7FA8D9)]",
              leftIcon ? "pl-9" : "pl-3",
              rightIcon ? "pr-9" : "pr-3",
              error
                ? "border-red-400 bg-red-50/20 text-red-900 focus:outline-red-500"
                : "border-slate-300 bg-white hover:border-slate-400",
              disabled && "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              {rightIcon}
            </div>
          )}
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

TextInput.displayName = "TextInput";
