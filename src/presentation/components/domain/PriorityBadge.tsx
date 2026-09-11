"use client";

import React from "react";
import { cn } from "@/presentation/utils/cn";

export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface PriorityBadgeProps {
  priority: PriorityLevel | string;
  className?: string;
  size?: "sm" | "md";
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className, size = "md" }) => {
  const normalized = (priority || "LOW").toUpperCase() as PriorityLevel;

  const configs: Record<
    PriorityLevel,
    { label: string; container: string; dot: string; isUrgent?: boolean }
  > = {
    LOW: {
      label: "Low",
      container: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
    },
    MEDIUM: {
      label: "Medium",
      container: "bg-blue-50 text-blue-800 border-blue-200",
      dot: "bg-blue-500",
    },
    HIGH: {
      label: "High",
      container: "bg-amber-50 text-amber-900 border-amber-200",
      dot: "bg-amber-500",
    },
    URGENT: {
      label: "Urgent",
      container: "bg-red-50 text-red-900 border-red-200",
      dot: "bg-red-600",
      isUrgent: true,
    },
  };

  const config = configs[normalized] || configs.LOW;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1.5",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border border-solid select-none",
        config.container,
        sizeClasses[size],
        className
      )}
    >
      {config.isUrgent ? (
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
        </span>
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} aria-hidden="true" />
      )}
      <span>{config.label}</span>
    </span>
  );
};
