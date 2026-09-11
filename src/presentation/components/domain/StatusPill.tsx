"use client";

import React from "react";
import { cn } from "@/presentation/utils/cn";

export type ComplaintStatusType =
  | "DRAFT"
  | "SUBMITTED"
  | "REVIEWED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "FORWARDED"
  | "ESCALATED"
  | "RESOLVED"
  | "CLOSED"
  | "REOPENED"
  | "REJECTED"
  | "DUPLICATE"
  | "CANCELLED";

export interface StatusPillProps {
  status: ComplaintStatusType | string;
  className?: string;
  size?: "sm" | "md";
}

interface StatusConfig {
  label: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  icon: React.ReactNode;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className, size = "md" }) => {
  const normalizedStatus = (status || "DRAFT").toUpperCase() as ComplaintStatusType;

  const configs: Record<ComplaintStatusType, StatusConfig> = {
    DRAFT: {
      label: "Draft",
      bgClass: "bg-[var(--color-status-draft-bg,#F1F5F9)]",
      borderClass: "border-[var(--color-status-draft-border,#CBD5E1)]",
      textClass: "text-[var(--color-status-draft-text,#475569)]",
      icon: <span className="h-1.5 w-1.5 rounded-full border border-slate-500 bg-transparent" aria-hidden="true" />,
    },
    SUBMITTED: {
      label: "Submitted",
      bgClass: "bg-[var(--color-status-submitted-bg,#EFF6FF)]",
      borderClass: "border-[var(--color-status-submitted-border,#BFDBFE)]",
      textClass: "text-[var(--color-status-submitted-text,#1E40AF)]",
      icon: <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />,
    },
    REVIEWED: {
      label: "Reviewed",
      bgClass: "bg-[var(--color-status-reviewed-bg,#EEF2FF)]",
      borderClass: "border-[var(--color-status-reviewed-border,#C7D2FE)]",
      textClass: "text-[var(--color-status-reviewed-text,#3730A3)]",
      icon: <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" aria-hidden="true" />,
    },
    ASSIGNED: {
      label: "Assigned",
      bgClass: "bg-[var(--color-status-assigned-bg,#F0FDFA)]",
      borderClass: "border-[var(--color-status-assigned-border,#99F6E4)]",
      textClass: "text-[var(--color-status-assigned-text,#115E59)]",
      icon: <span className="h-1.5 w-1.5 rounded-full bg-teal-600" aria-hidden="true" />,
    },
    IN_PROGRESS: {
      label: "In Progress",
      bgClass: "bg-[var(--color-status-inprogress-bg,#ECFDF5)]",
      borderClass: "border-[var(--color-status-inprogress-border,#A7F3D0)]",
      textClass: "text-[var(--color-status-inprogress-text,#065F46)]",
      icon: (
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
        </span>
      ),
    },
    FORWARDED: {
      label: "Forwarded",
      bgClass: "bg-[var(--color-status-forwarded-bg,#FFFBEB)]",
      borderClass: "border-[var(--color-status-forwarded-border,#FDE68A)]",
      textClass: "text-[var(--color-status-forwarded-text,#92400E)]",
      icon: (
        <svg className="h-3 w-3 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      ),
    },
    ESCALATED: {
      label: "Escalated",
      bgClass: "bg-[var(--color-status-escalated-bg,#FFF1F2)]",
      borderClass: "border-[var(--color-status-escalated-border,#FECDD3)]",
      textClass: "text-[var(--color-status-escalated-text,#9F1239)]",
      icon: (
        <svg className="h-3 w-3 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    RESOLVED: {
      label: "Resolved",
      bgClass: "bg-[var(--color-status-resolved-bg,#F0FDF4)]",
      borderClass: "border-[var(--color-status-resolved-border,#BBF7D0)]",
      textClass: "text-[var(--color-status-resolved-text,#166534)]",
      icon: (
        <svg className="h-3 w-3 text-emerald-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
    },
    CLOSED: {
      label: "Closed",
      bgClass: "bg-[var(--color-status-closed-bg,#F8FAFC)]",
      borderClass: "border-[var(--color-status-closed-border,#E2E8F0)]",
      textClass: "text-[var(--color-status-closed-text,#475569)]",
      icon: (
        <svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    REOPENED: {
      label: "Reopened",
      bgClass: "bg-[var(--color-status-reopened-bg,#FFFBEB)]",
      borderClass: "border-[var(--color-status-reopened-border,#FCD34D)]",
      textClass: "text-[var(--color-status-reopened-text,#78350F)]",
      icon: (
        <svg className="h-3 w-3 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    REJECTED: {
      label: "Rejected",
      bgClass: "bg-[var(--color-status-rejected-bg,#FEF2F2)]",
      borderClass: "border-[var(--color-status-rejected-border,#FECACA)]",
      textClass: "text-[var(--color-status-rejected-text,#991B1B)]",
      icon: (
        <svg className="h-3 w-3 text-red-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      ),
    },
    DUPLICATE: {
      label: "Duplicate",
      bgClass: "bg-[var(--color-status-duplicate-bg,#F8FAFC)]",
      borderClass: "border-[var(--color-status-duplicate-border,#E2E8F0)]",
      textClass: "text-[var(--color-status-duplicate-text,#64748B)]",
      icon: (
        <svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      ),
    },
    CANCELLED: {
      label: "Cancelled",
      bgClass: "bg-[var(--color-status-cancelled-bg,#F8FAFC)]",
      borderClass: "border-[var(--color-status-cancelled-border,#E2E8F0)]",
      textClass: "text-[var(--color-status-cancelled-text,#64748B)]",
      icon: (
        <svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
    },
  };

  const config = configs[normalizedStatus] || configs.DRAFT;

  const sizeClasses: Record<string, string> = {
    sm: "px-2 py-0.5 text-xs gap-1.5",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border border-solid select-none",
        config.bgClass,
        config.borderClass,
        config.textClass,
        sizeClasses[size],
        className
      )}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
