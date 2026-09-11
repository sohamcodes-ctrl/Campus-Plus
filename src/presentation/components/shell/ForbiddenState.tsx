"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/presentation/context/AuthContext";
import { formatRoleLabel } from "@/presentation/navigation/navigationConfig";
import { Button } from "@/presentation/components/primitives/Button";
import { Badge } from "@/presentation/components/primitives/Badge";

export const ForbiddenState: React.FC = () => {
  const { role } = useAuth();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h1 className="text-xl font-bold text-slate-900 tracking-tight">
        403 — Access Denied
      </h1>

      <p className="text-sm text-slate-600 max-w-md">
        Your current authenticated account role does not have authorization to access this area of Campus Plus.
      </p>

      {role && (
        <div className="pt-1">
          <Badge variant="neutral" size="sm">
            Current Role: {formatRoleLabel(role)}
          </Badge>
        </div>
      )}

      <div className="pt-3">
        <Link href="/dashboard">
          <Button variant="primary" size="md">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
