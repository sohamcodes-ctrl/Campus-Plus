"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/presentation/utils/cn";

export interface BreadcrumbsProps {
  customLabels?: Record<string, string>;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customLabels, className }) => {
  const pathname = usePathname();

  if (!pathname || pathname === "/" || pathname === "/login") {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);

  const formatSegment = (seg: string): string => {
    if (customLabels && customLabels[seg]) {
      return customLabels[seg];
    }
    if (seg.startsWith("CP-")) {
      return seg;
    }
    if (seg === "dashboard") return "Dashboard";
    if (seg === "complaints") return "Complaints";
    if (seg === "new") return "New";
    return seg.replace(/-/g, " ");
  };

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs text-slate-500", className)}>
      <ol className="flex items-center space-x-1.5 flex-wrap">
        <li>
          <Link
            href="/dashboard"
            className="hover:text-slate-800 transition-colors inline-flex items-center gap-1 font-medium"
          >
            Home
          </Link>
        </li>

        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = "/" + segments.slice(0, index + 1).join("/");
          const label = formatSegment(segment);

          return (
            <li key={href} className="inline-flex items-center space-x-1.5">
              <span className="text-slate-300" aria-hidden="true">
                /
              </span>
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-semibold text-slate-800 max-w-[200px] truncate capitalize"
                  title={label}
                >
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-slate-800 transition-colors max-w-[140px] truncate capitalize"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
