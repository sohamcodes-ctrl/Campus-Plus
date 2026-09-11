"use client";

import React, { useEffect, useRef, useId } from "react";
import { cn } from "@/presentation/utils/cn";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  position?: "left" | "right";
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  className,
}) => {
  const drawerId = useId();
  const titleId = `${drawerId}-title`;
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (typeof document !== "undefined") {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (typeof document !== "undefined") {
        document.body.style.overflow = "unset";
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
          previousFocusRef.current.focus();
        }
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      className="fixed inset-0 z-50 flex overflow-hidden"
    >
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        className={cn(
          "relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform border-slate-200",
          position === "right" ? "ml-auto border-l" : "mr-auto border-r",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          {title && (
            <h3 id={titleId} className="text-base font-semibold text-slate-900">
              {title}
            </h3>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="grow overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};
