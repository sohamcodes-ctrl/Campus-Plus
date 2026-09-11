"use client";

import React from "react";
import { cn } from "@/presentation/utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "text",
  width,
  height,
  className,
  style,
  ...props
}) => {
  const variantStyles = {
    text: "h-4 w-full rounded",
    circular: "rounded-full shrink-0",
    rectangular: "rounded-md",
  };

  const inlineStyle: React.CSSProperties = {
    width: width !== undefined ? (typeof width === "number" ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === "number" ? `${height}px` : height) : undefined,
    ...style,
  };

  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse bg-slate-200", variantStyles[variant], className)}
      style={inlineStyle}
      {...props}
    />
  );
};
