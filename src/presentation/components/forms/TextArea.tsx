"use client";

import React, { useId } from "react";
import { cn } from "@/presentation/utils/cn";

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  minChars?: number;
  maxChars?: number;
  showCharCount?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      id: customId,
      label,
      helperText,
      error,
      minChars,
      maxChars,
      showCharCount = false,
      required,
      disabled,
      value,
      defaultValue,
      className,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;
    const counterId = `${id}-counter`;

    const currentLength = typeof value === "string" ? value.length : 0;
    const isBelowMin = minChars !== undefined && currentLength > 0 && currentLength < minChars;
    const isAboveMax = maxChars !== undefined && currentLength > maxChars;

    const describedBy = [
      error ? errorId : null,
      helperText ? helperId : null,
      showCharCount ? counterId : null,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={id}
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              {label}
              {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
            </label>
          )}

          {showCharCount && (
            <span
              id={counterId}
              aria-live="polite"
              className={cn(
                "text-xs font-mono select-none",
                isAboveMax || isBelowMin ? "text-amber-700 font-semibold" : "text-slate-400"
              )}
            >
              {currentLength}
              {maxChars !== undefined ? ` / ${maxChars}` : ""}
              {minChars !== undefined && currentLength < minChars ? ` (min ${minChars})` : ""}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={id}
          rows={rows}
          value={value}
          defaultValue={defaultValue}
          required={required}
          disabled={disabled}
          aria-invalid={!!error || isAboveMax}
          aria-describedby={describedBy || undefined}
          className={cn(
            "block w-full rounded-md border text-sm transition-colors py-2 px-3 text-slate-900 placeholder:text-slate-400",
            "focus:outline-2 focus:outline-offset-1 focus:outline-[var(--role-primary,#7FA8D9)]",
            error || isAboveMax
              ? "border-red-400 bg-red-50/20 text-red-900 focus:outline-red-500"
              : "border-slate-300 bg-white hover:border-slate-400",
            disabled && "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed",
            className
          )}
          {...props}
        />

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

TextArea.displayName = "TextArea";
