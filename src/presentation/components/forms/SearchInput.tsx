"use client";

import React, { useId } from "react";
import { cn } from "@/presentation/utils/cn";

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  shortcutHint?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onClear, shortcutHint, className, placeholder = "Search...", ...props }, ref) => {
    const id = useId();
    const hasValue = value !== undefined && value !== null && String(value).length > 0;

    return (
      <div className="relative w-full rounded-md shadow-xs">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>

        <input
          ref={ref}
          id={id}
          type="search"
          value={value}
          placeholder={placeholder}
          aria-label={placeholder}
          className={cn(
            "block w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-14 text-sm text-slate-900 placeholder:text-slate-400 transition-colors",
            "focus:outline-2 focus:outline-offset-1 focus:outline-[var(--role-primary,#7FA8D9)] hover:border-slate-400",
            className
          )}
          {...props}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {hasValue && onClear && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear search"
              className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            >
              <svg
                className="h-3.5 w-3.5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}

          {shortcutHint && !hasValue && (
            <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 px-1.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-50">
              {shortcutHint}
            </kbd>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
