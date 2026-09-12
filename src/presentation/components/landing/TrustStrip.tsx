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
      icon: <ShieldLockIcon className="w-5 h-5 text-[#0B3C78] shrink-0" />,
      line1: "Secure & Role-based",
      line2: "Access Control",
    },
    {
      icon: <DocumentTrackIcon className="w-5 h-5 text-[#0B3C78] shrink-0" />,
      line1: "Track Every Step",
      line2: "in Real-time",
    },
    {
      icon: <BarChartIcon className="w-5 h-5 text-[#0B3C78] shrink-0" />,
      line1: "Transparency",
      line2: "You Can Trust",
    },
    {
      icon: <ShieldCheckIcon className="w-5 h-5 text-[#0B3C78] shrink-0" />,
      line1: "Institutional",
      line2: "Accountability",
    },
  ];

  return (
    <div className="mt-10 sm:mt-12 pt-6 pb-2 border-t border-slate-200/60">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:divide-x lg:divide-slate-200">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center space-x-3 ${idx > 0 ? "lg:pl-6" : ""} ${idx < items.length - 1 ? "lg:pr-6" : ""}`}
          >
            {item.icon}
            <div className="text-[12px] sm:text-[13px] font-semibold text-slate-800 leading-snug">
              <div>{item.line1}</div>
              <div>{item.line2}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
