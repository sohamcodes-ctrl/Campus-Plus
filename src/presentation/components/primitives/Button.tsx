"use client";

import React from "react";
import { cn } from "@/presentation/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "destructive" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer disabled:cursor-not-allowed";

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        "bg-[var(--role-primary)] text-[var(--role-btn-text)] hover:opacity-90 active:opacity-95 shadow-xs focus-visible:outline-[var(--role-primary)]",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 shadow-xs focus-visible:outline-slate-400",
      outline:
        "bg-transparent text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-slate-300 focus-visible:outline-slate-400",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-xs focus-visible:outline-red-600",
      ghost:
        "bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900 focus-visible:outline-slate-400",
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: "px-2.5 py-1.5 text-xs rounded-md min-h-[32px] gap-1.5",
      md: "px-3.5 py-2 text-sm rounded-md min-h-[40px] gap-2",
      lg: "px-4.5 py-2.5 text-base rounded-lg min-h-[44px] gap-2.5",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
        )}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
