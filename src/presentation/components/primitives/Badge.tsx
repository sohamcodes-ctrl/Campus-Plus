"use client";

import React from "react";
import { cn } from "@/presentation/utils/cn";

export type BadgeVariant = "neutral" | "info" | "success" | "warning" | "danger" | "role";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  size = "md",
  dot = false,
  className,
  children,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { badge: string; dot: string }> = {
    neutral: {
      badge: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
    },
    info: {
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
    },
    success: {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },
    warning: {
      badge: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
    },
    danger: {
      badge: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
    },
    role: {
      badge: "bg-[var(--role-accent)] text-[var(--role-text)] border-[var(--role-secondary)]",
      dot: "bg-[var(--role-primary)]",
    },
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border border-solid select-none",
        variantStyles[variant].badge,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", variantStyles[variant].dot)}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
