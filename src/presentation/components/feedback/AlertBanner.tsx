"use client";

import React from "react";
import { cn } from "@/presentation/utils/cn";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  isDismissible?: boolean;
  onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  variant = "info",
  title,
  isDismissible = false,
  onDismiss,
  className,
  children,
  ...props
}) => {
  const variantStyles: Record<AlertVariant, { container: string; iconColor: string }> = {
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-900",
      iconColor: "text-blue-500",
    },
    success: {
      container: "bg-emerald-50 border-emerald-200 text-emerald-900",
      iconColor: "text-emerald-500",
    },
    warning: {
      container: "bg-amber-50 border-amber-200 text-amber-900",
      iconColor: "text-amber-500",
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-900",
      iconColor: "text-red-500",
    },
  };

  const icons: Record<AlertVariant, React.ReactNode> = {
    info: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const role = variant === "error" || variant === "warning" ? "alert" : "status";

  return (
    <div
      role={role}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 text-sm shadow-xs",
        variantStyles[variant].container,
        className
      )}
      {...props}
    >
      <div className={cn("shrink-0 mt-0.5", variantStyles[variant].iconColor)}>
        {icons[variant]}
      </div>

      <div className="grow space-y-0.5">
        {title && <h5 className="font-semibold">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>

      {isDismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="shrink-0 p-1 text-current opacity-60 hover:opacity-100 rounded cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
