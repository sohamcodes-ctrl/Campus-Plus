"use client";

import React from "react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { Breadcrumbs } from "./Breadcrumbs";

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      {/* WCAG Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:p-3 focus:bg-slate-900 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-2 focus:outline-offset-2 focus:outline-[var(--role-primary,#7FA8D9)]"
      >
        Skip to main content
      </a>

      {/* Persistent Top Bar */}
      <TopBar />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 outline-hidden"
        >
          <div className="mx-auto max-w-6xl space-y-4">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};
