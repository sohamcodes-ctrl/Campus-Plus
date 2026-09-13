import React from "react";
import {
  ShieldLockIcon,
  DocumentTrackIcon,
  BarChartIcon,
  ShieldCheckIcon,
} from "./LandingIcons";

export const TrustStrip: React.FC = () => {
  const items = [
    {
      icon: <ShieldLockIcon className="w-4 h-4 text-[#0B3C78] shrink-0" />,
      line1: "Secure & Role-based",
      line2: "Access Control",
    },
    {
      icon: <DocumentTrackIcon className="w-4 h-4 text-[#0B3C78] shrink-0" />,
      line1: "Track Every Step",
      line2: "in Real-time",
    },
    {
      icon: <BarChartIcon className="w-4 h-4 text-[#0B3C78] shrink-0" />,
      line1: "Transparency",
      line2: "You Can Trust",
    },
    {
      icon: <ShieldCheckIcon className="w-4 h-4 text-[#0B3C78] shrink-0" />,
      line1: "Institutional",
      line2: "Accountability",
    },
  ];

  return (
    <div className="mt-7 pt-5 border-t border-slate-200/50 max-w-xl lg:max-w-2xl">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-0 sm:divide-x sm:divide-slate-200/80">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center space-x-2 ${idx > 0 ? "sm:pl-4" : ""} ${idx < items.length - 1 ? "sm:pr-4" : ""}`}
          >
            {item.icon}
            <div className="text-[11px] sm:text-[11.5px] font-semibold text-slate-800 leading-tight">
              <div>{item.line1}</div>
              <div>{item.line2}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
