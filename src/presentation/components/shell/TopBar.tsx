"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/presentation/context/AuthContext";
import { Badge } from "@/presentation/components/primitives/Badge";
import { Drawer } from "@/presentation/components/overlays/Drawer";
import { formatRoleLabel } from "@/presentation/navigation/navigationConfig";

export const TopBar: React.FC = () => {
  const { actor, role, signOut } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-2xs">
      {/* 3px Role Brand Accent Bar */}
      <div
        className="h-[3px] w-full bg-[var(--role-primary,#7FA8D9)] transition-colors duration-300"
        aria-hidden="true"
      />

      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left: Branding & System Name */}
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2.5 font-bold tracking-tight text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--role-primary,#7FA8D9)] rounded"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--role-primary,#7FA8D9)] text-[var(--role-btn-text,#1E3A5F)] text-xs font-black shadow-xs">
              C+
            </span>
            <span className="text-base font-bold">Campus Plus</span>
          </Link>
          <span className="hidden sm:inline-block text-slate-300">|</span>
          <span className="hidden sm:inline-block text-xs font-medium text-slate-500">
            Grievance Resolution
          </span>
        </div>

        {/* Right: Role Indicator, Notifications, and User Identity */}
        <div className="flex items-center space-x-3">
          {/* Active Role Badge */}
          {role && (
            <Badge variant="role" size="sm" dot>
              {formatRoleLabel(role)}
            </Badge>
          )}

          {/* In-App Notifications Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            aria-label="View notifications"
            className="relative p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--role-primary,#7FA8D9)]"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          {/* User Menu Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-expanded={isUserMenuOpen}
              aria-label="Open user menu"
              className="flex items-center space-x-2 rounded-full p-1 text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--role-primary,#7FA8D9)] cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 uppercase">
                {actor?.userId ? actor.userId.substring(0, 2) : "U"}
              </div>
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-50 text-xs"
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900 truncate">
                    {formatRoleLabel(role)} Account
                  </p>
                  <p className="text-slate-500 font-mono text-[10px] truncate">
                    ID: {actor?.userId || "Unknown"}
                  </p>
                  {actor?.departmentId && (
                    <p className="text-slate-500 text-[10px] truncate mt-0.5">
                      Dept: {actor.departmentId}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await signOut();
                    if (typeof window !== "undefined") {
                      window.location.replace("/");
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Drawer (Honest API Gap Handling per GAP-001) */}
      <Drawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        title="Notifications"
      >
        <div className="space-y-4 text-center py-8 text-sm text-slate-500">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <h4 className="font-semibold text-slate-800">No New Notifications</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            In-app notification subscription will be integrated in an upcoming phase.
            (Tracked under API Gap GAP-001 &amp; GAP-002).
          </p>
        </div>
      </Drawer>
    </header>
  );
};
