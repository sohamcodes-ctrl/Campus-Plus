import React from "react";
import {
  ClipboardCheckIcon,
  ClockIcon,
  UsersGroupIcon,
  ShieldCheckIcon,
} from "./LandingIcons";

export const MetricsBar: React.FC = () => {
  const metrics = [
    {
      icon: <ClipboardCheckIcon className="w-6 h-6 text-emerald-600" />,
      bgColor: "bg-emerald-50",
      value: "2,482",
      label: "Complaints Registered",
    },
    {
      icon: <ClockIcon className="w-6 h-6 text-blue-600" />,
      bgColor: "bg-blue-50",
      value: "1,842",
      label: "Resolved",
    },
    {
      icon: <UsersGroupIcon className="w-6 h-6 text-purple-600" />,
      bgColor: "bg-purple-50",
      value: "98%",
      label: "Actioned in Time",
    },
    {
      icon: <ShieldCheckIcon className="w-6 h-6 text-rose-600" />,
      bgColor: "bg-rose-50",
      value: "100%",
      label: "Data Confidentiality",
    },
  ];

  return (
    <section className="relative -mt-10 lg:-mt-12 z-20 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 px-6 py-6 sm:px-8 sm:py-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4 lg:gap-0 lg:divide-x lg:divide-slate-100">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-center space-x-4 ${idx > 0 ? "lg:pl-8" : ""} ${idx < metrics.length - 1 ? "lg:pr-8" : ""}`}
            >
              <div
                className={`w-12 h-12 rounded-full ${m.bgColor} flex items-center justify-center shrink-0`}
              >
                {m.icon}
              </div>
              <div>
                <div className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-none">
                  {m.value}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1.5 leading-snug">
                  {m.label}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Data honesty badge */}
        <div className="mt-4 pt-3 border-t border-slate-50 text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Illustrative Metrics · Institutional Telemetry
          </span>
        </div>
      </div>
    </section>
  );
};
