"use client";

import React from "react";
import Link from "next/link";

export function StudentDashboardFooter() {
  return (
    <footer className="pt-8 pb-4 border-t border-slate-200/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
      <p className="text-slate-400">
        &copy; {new Date().getFullYear()} Campus Plus. All rights reserved.
      </p>

      <div className="flex items-center space-x-3 text-slate-500">
        <Link href="/privacy" className="hover:text-slate-800 transition-colors">
          Privacy Policy
        </Link>
        <span className="text-slate-300" aria-hidden="true">|</span>
        <Link href="/terms" className="hover:text-slate-800 transition-colors">
          Terms of Use
        </Link>
        <span className="text-slate-300" aria-hidden="true">|</span>
        <Link href="/contact" className="hover:text-slate-800 transition-colors">
          Contact Us
        </Link>
      </div>
    </footer>
  );
}
