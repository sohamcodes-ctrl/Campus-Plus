"use client";

import React, { useEffect, useRef, useId } from "react";
import { cn } from "@/presentation/utils/cn";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnBackdropClick?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  closeOnBackdropClick = true,
  className,
}) => {
  const modalId = useId();
  const titleId = `${modalId}-title`;
  const descriptionId = `${modalId}-desc`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save previous active focus
    if (typeof document !== "undefined") {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Initial focus on first interactive element or dialog
    const timeout = setTimeout(() => {
      if (dialogRef.current) {
        const firstInput = dialogRef.current.querySelector<HTMLElement>(
          'input, select, textarea, button:not([aria-label="Close dialog"])'
        );
        if (firstInput) {
          firstInput.focus();
        } else {
          dialogRef.current.focus();
        }
      }
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeout);
      if (typeof document !== "undefined") {
        document.body.style.overflow = "unset";
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
          previousFocusRef.current.focus();
        }
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />

      {/* Modal Dialog Card */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full rounded-xl bg-white p-6 shadow-xl transition-all border border-slate-200 outline-hidden",
          sizeClasses[size],
          className
        )}
      >
        <div className="flex items-start justify-between pb-3">
          <div>
            {title && (
              <h3 id={titleId} className="text-lg font-semibold text-slate-900 tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
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

        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
};
