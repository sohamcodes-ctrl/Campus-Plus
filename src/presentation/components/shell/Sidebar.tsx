"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/presentation/context/AuthContext";
import { getNavigationItemsForRole } from "@/presentation/navigation/navigationConfig";
import { UserRole } from "@/domain/complaint";
import { cn } from "@/presentation/utils/cn";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { role, user } = useAuth();
  const isComplainant =
    role === UserRole.ROLE_STUDENT || role === UserRole.ROLE_FACULTY;

  // Student specific navigation menu matching reference image
  const studentNavItems = [
    {
      id: "menu-dashboard",
      label: "Dashboard",
      href: "/dashboard",
      exact: true,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "menu-my-complaints",
      label: "My Complaints",
      href: "/complaints",
      exact: true,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "menu-submit-complaint",
      label: "Submit Complaint",
      href: "/complaints/new",
      exact: true,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "menu-my-verifications",
      label: "My Verifications",
      href: "/complaints?status=RESOLVED",
      exact: false,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: "menu-announcements",
      label: "Announcements",
      href: "#announcements",
      exact: false,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      id: "menu-help-support",
      label: "Help & Support",
      href: "/help",
      exact: false,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: "menu-my-account",
      label: "My Account",
      href: "/profile",
      exact: false,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  const standardNavItems = getNavigationItemsForRole(role);

  const institutionName =
    (user?.user_metadata?.institution as string) || "R.C. Patel Institute of Technology";

  return (
    <aside
      aria-label="Main Navigation"
      className="hidden md:flex flex-col w-60 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-59px)] py-4 select-none"
    >
      <div>
        <div className="px-4 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isComplainant ? "MAIN MENU" : "Navigation"}
          </span>
        </div>

        <nav className="space-y-0.5 px-2">
          {isComplainant
            ? studentNavItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href || (item.href === "/dashboard" && pathname === "/student-preview")
                  : pathname === item.href || (item.href !== "#announcements" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors border-l-3",
                      isActive
                        ? "bg-[#EAF2FB] text-[#1E3A5F] border-[#7FA8D9] font-bold shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"
                    )}
                  >
                    <span className={cn(isActive ? "text-[#1E3A5F]" : "text-slate-400")}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })
            : standardNavItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors border-l-3",
                      isActive
                        ? "bg-[var(--role-accent,#EAF2FB)]/50 text-[var(--role-btn-text,#1E3A5F)] border-[var(--role-primary,#7FA8D9)] font-semibold shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"
                    )}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
        </nav>
      </div>

      {/* Institutional Identity Section (Directly following main menu with divider) */}
      <div className="px-3 pt-3 mt-4 border-t border-slate-100">
        <div className="px-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            INSTITUTION
          </span>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF2FB] text-[#1E3A5F]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 leading-tight truncate" title={institutionName}>
              {institutionName}
            </p>
            <p className="text-[10px] text-slate-500">Shirpur</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
