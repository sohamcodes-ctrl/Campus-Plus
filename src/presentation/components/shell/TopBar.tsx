"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/presentation/context/AuthContext";
import { Badge } from "@/presentation/components/primitives/Badge";
import { Drawer } from "@/presentation/components/overlays/Drawer";
import { formatRoleLabel } from "@/presentation/navigation/navigationConfig";
import { UserRole } from "@/domain/complaint";
import { cn } from "@/presentation/utils/cn";
import { apiClient } from "@/presentation/services/apiClient";

export const TopBar: React.FC = () => {
  const { role, user, signOut } = useAuth();
  const pathname = usePathname();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<Record<string, unknown>>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isComplainant =
    role === UserRole.ROLE_STUDENT || role === UserRole.ROLE_FACULTY;

  useEffect(() => {
    if (!isNotificationsOpen) return;
    apiClient.getNotifications()
      .then((result) => {
        setNotifications(result.items);
        setUnreadCount(result.unreadCount);
      })
      .catch(() => {
        setNotifications([]);
        setUnreadCount(0);
      });
  }, [isNotificationsOpen]);

  // Student name and initials resolution
  const studentName =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    (user?.email ? user.email.split("@")[0].replace(/[._]/g, " ") : "Student");

  const initials = studentName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "SS";

  // Center navigation items for Complainant/Student role matching reference layout
  const complainantNavLinks = [
    { label: "Dashboard", href: "/dashboard", exact: true },
    { label: "My Complaints", href: "/complaints", exact: true },
    { label: "Submit Complaint", href: "/complaints/new", exact: true },
    { label: "Notifications", href: "#notifications", isAction: true },
    { label: "Help & Support", href: "/help", exact: false },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-2xs">
      {/* 3px Role Brand Accent Bar */}
      <div
        className="h-[3px] w-full bg-[var(--role-primary,#7FA8D9)] transition-colors duration-300"
        aria-hidden="true"
      />

      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left: Branding & Tagline matching reference visual contract */}
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2.5 font-bold tracking-tight text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--role-primary,#7FA8D9)] rounded"
          >
            {/* Shield Logo with C+ */}
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--role-primary,#7FA8D9)] text-[var(--role-btn-text,#1E3A5F)] text-xs font-black shadow-xs">
              C+
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-tight">Campus Plus</span>
              <span className="text-[10px] text-slate-400 font-normal leading-none hidden sm:inline-block">
                Accountable. Transparent. Together.
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation Links (Complainant view matching reference design) */}
        {isComplainant && (
          <nav
            aria-label="Global Student Navigation"
            className="hidden lg:flex items-center space-x-6 h-full text-xs font-medium"
          >
            {complainantNavLinks.map((link) => {
              const isActive =
                !link.isAction &&
                (link.exact
                  ? pathname === link.href || (link.href === "/dashboard" && pathname === "/student-preview")
                  : pathname?.startsWith(link.href));

              if (link.isAction) {
                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => setIsNotificationsOpen(true)}
                    className="relative text-slate-600 hover:text-slate-900 transition-colors py-4 cursor-pointer"
                  >
                    {link.label}
                  </button>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative py-4 transition-colors",
                    isActive
                      ? "text-blue-600 font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-blue-600"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right: Role Indicator, Notifications, and User Identity */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Active Role Badge (Displayed for staff/admin, omitted in complainant header per reference) */}
          {role && !isComplainant && (
            <Badge variant="role" size="sm" dot>
              {formatRoleLabel(role)}
            </Badge>
          )}

          {/* In-app notifications are loaded from the authenticated inbox. */}
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
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile & Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-expanded={isUserMenuOpen}
              aria-label="Open user menu"
              className="flex items-center space-x-2.5 rounded-lg p-1 text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--role-primary,#7FA8D9)] cursor-pointer"
            >
              {/* Initials Avatar */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7FA8D9] text-[#1E3A5F] text-xs font-bold shadow-xs select-none">
                {initials}
              </div>

              {/* Student Name & Role Subtitle matching reference */}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                  {studentName}
                </span>
                <span className="text-[10px] text-slate-500 leading-none">
                  {formatRoleLabel(role)}
                </span>
              </div>

              {/* Dropdown Chevron */}
              <svg
                className="h-3.5 w-3.5 text-slate-400 hidden sm:block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg z-50 text-xs"
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900 truncate">
                    {studentName}
                  </p>
                  <p className="text-slate-500 text-[11px] truncate">
                    {user?.email || "Authenticated Account"}
                  </p>
                  <p className="text-slate-400 font-mono text-[10px] truncate mt-0.5">
                    Role: {formatRoleLabel(role)}
                  </p>
                </div>

                <Link
                  href="/complaints"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  My Complaints
                </Link>

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
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer border-t border-slate-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Drawer */}
      <Drawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        title="Notifications"
      >
        <div className="space-y-3 py-4 text-sm text-slate-500">
          {notifications.length > 0 ? notifications.map((notification) => {
            const id = String(notification.id);
            const isRead = Boolean(notification.is_read);
            return (
              <button
                key={id}
                type="button"
                onClick={() => apiClient.markNotificationRead(id).then(() => {
                  setNotifications((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item));
                  setUnreadCount((count) => Math.max(0, count - (isRead ? 0 : 1)));
                })}
                className={`w-full rounded-lg border p-3 text-left ${isRead ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50"}`}
              >
                <div className="font-semibold text-slate-800">{String(notification.title)}</div>
                <div className="mt-1 text-xs text-slate-600">{String(notification.message)}</div>
              </button>
            );
          }) : <>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF2FB] text-[#1E3A5F]">
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
          <h4 className="font-semibold text-slate-800">You&apos;re all caught up</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            New complaint updates and actions will appear here.
          </p>
          </>}
        </div>
      </Drawer>
    </header>
  );
};
