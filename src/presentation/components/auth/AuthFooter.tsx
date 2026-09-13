"use client";

import React from "react";
import Link from "next/link";

export function AuthFooter() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/80 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
        <div>
          <span>&copy; {new Date().getFullYear()} Campus Plus. Official Institutional Grievance System.</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/privacy" className="hover:text-slate-800 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-slate-300">&bull;</span>
          <Link href="/terms" className="hover:text-slate-800 transition-colors">
            Terms of Use
          </Link>
          <span className="text-slate-300">&bull;</span>
          <Link href="/help" className="hover:text-slate-800 transition-colors">
            IT Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
