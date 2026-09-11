"use client";

import React from "react";
import { cn } from "@/presentation/utils/cn";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  label?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  label,
  className,
  ...props
}) => {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn("inline-block w-px self-stretch bg-slate-200 mx-2", className)}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn("relative flex py-3 items-center", className)}
        {...props}
      >
        <div className="grow border-t border-slate-200" />
        <span className="shrink mx-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div className="grow border-t border-slate-200" />
      </div>
    );
  }

  return (
    <hr
      role="separator"
      aria-orientation="horizontal"
      className={cn("border-0 border-t border-slate-200 my-4 w-full", className)}
      {...props}
    />
  );
};
