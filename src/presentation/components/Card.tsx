import React from "react";

export interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, description, children, className = "" }) => {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
};
