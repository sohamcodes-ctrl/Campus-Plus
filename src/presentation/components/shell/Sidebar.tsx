"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/presentation/context/AuthContext";
import { getNavigationItemsForRole } from "@/presentation/navigation/navigationConfig";
import { cn } from "@/presentation/utils/cn";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { role } = useAuth();
  const navItems = getNavigationItemsForRole(role);

  return (
    <aside
      aria-label="Main Navigation"
      className="hidden md:flex flex-col w-60 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-59px)] py-4 select-none"
    >
      <div className="px-4 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

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

      <div className="px-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400">
        Campus Plus &bull; Confidential
      </div>
    </aside>
  );
};
