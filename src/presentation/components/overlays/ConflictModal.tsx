"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "../primitives/Button";

export interface ConflictModalProps {
  isOpen: boolean;
  expectedVersion?: number;
  currentVersion?: number;
  onClose: () => void;
  onReload: () => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  isOpen,
  expectedVersion,
  currentVersion,
  onClose,
  onReload,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Modified by Another User (HTTP 409)"
      size="md"
      closeOnBackdropClick={false}
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
          <div className="flex items-start gap-2">
            <svg
              className="h-5 w-5 text-amber-600 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-semibold">Optimistic Concurrency Conflict</p>
              <p className="mt-1 text-xs text-amber-800">
                This complaint was updated by another administrator, handler, or automated workflow while you were viewing it.
                Your pending action cannot be applied to avoid overwriting recent updates.
              </p>
            </div>
          </div>
        </div>

        {(expectedVersion !== undefined || currentVersion !== undefined) && (
          <div className="rounded-md bg-slate-50 p-3 text-xs font-mono text-slate-600 border border-slate-200 space-y-1">
            {expectedVersion !== undefined && (
              <div>Your Form Version: <span className="font-semibold text-slate-800">v{expectedVersion}</span></div>
            )}
            {currentVersion !== undefined && (
              <div>Server Version: <span className="font-semibold text-emerald-700">v{currentVersion}</span></div>
            )}
          </div>
        )}

        <p className="text-xs text-slate-500">
          Please reload the latest state to view the current details, remarks, and lifecycle status before re-attempting your action.
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" size="md" onClick={onReload}>
            Reload Latest Complaint
          </Button>
        </div>
      </div>
    </Modal>
  );
};
