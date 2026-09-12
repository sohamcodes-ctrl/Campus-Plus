"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/presentation/context/AuthContext";
import { getNavigationItemsForRole } from "@/presentation/navigation/navigationConfig";
import { Drawer } from "@/presentation/components/overlays/Drawer";
import { cn } from "@/presentation/utils/cn";

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { role, signOut } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const navItems = getNavigationItemsForRole(role);
  const primaryItems = navItems.slice(0, 3);

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 flex items-center justify-around z-40 px-2 shadow-lg"
      >
        {primaryItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] text-[11px] font-medium transition-colors",
                isActive
                  ? "text-[var(--role-btn-text,#1E3A5F)] font-bold"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          aria-label="Open more navigation options"
          className="flex flex-col items-center justify-center flex-1 h-full min-h-[44px] text-[11px] font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <span>More</span>
        </button>
      </nav>

      <Drawer
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        title="Campus Navigation"
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMoreOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block px-3 py-2.5 rounded-md text-sm font-medium",
                    isActive
                      ? "bg-[var(--role-accent,#EAF2FB)] text-[var(--role-btn-text,#1E3A5F)] font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={async () => {
                setIsMoreOpen(false);
                await signOut();
                if (typeof window !== "undefined") {
                  window.location.replace("/");
                }
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
};
