import React from "react";
import Link from "next/link";
import {
  StudentCapIcon,
  FacultyUserIcon,
  PillarBuildingIcon,
  ShieldStarIcon,
  UsersGroupIcon,
  AdminGearShieldIcon,
  ArrowRightIcon,
} from "./LandingIcons";

export const RoleEcosystem: React.FC = () => {
  const roles = [
    {
      title: "Students",
      desc: "Submit grievances and track resolution progress.",
      icon: <StudentCapIcon className="w-4 h-4 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      title: "Faculty / Handlers",
      desc: "Review, assign and resolve grievances efficiently.",
      icon: <FacultyUserIcon className="w-4 h-4 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      title: "HODs",
      desc: "Oversee departmental grievances and escalations.",
      icon: <PillarBuildingIcon className="w-4 h-4 text-purple-600" />,
      bg: "bg-purple-50",
    },
    {
      title: "Directors / Authorities",
      desc: "Monitor escalated issues and ensure accountability.",
      icon: <ShieldStarIcon className="w-4 h-4 text-blue-800" />,
      bg: "bg-blue-50",
    },
    {
      title: "Institutional Management",
      desc: "Analyze trends and improve institutional processes.",
      icon: <UsersGroupIcon className="w-4 h-4 text-rose-600" />,
      bg: "bg-rose-50",
    },
    {
      title: "System Admins",
      desc: "Maintain system integrity, users and configurations.",
      icon: <AdminGearShieldIcon className="w-4 h-4 text-slate-700" />,
      bg: "bg-slate-100",
    },
  ];

  return (
    <section id="roles" className="pt-10 pb-20 sm:pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center scroll-mt-20">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-8 sm:mb-10">
        Who Can Use Campus Plus
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 sm:gap-4 text-left">
        {roles.map((r, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between h-[200px]"
          >
            <div>
              <div
                className={`w-9 h-9 rounded-lg ${r.bg} flex items-center justify-center mb-3`}
              >
                {r.icon}
              </div>
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 mb-1 leading-tight">
                {r.title}
              </h3>
              <p className="text-[11px] text-slate-500 leading-snug">
                {r.desc}
              </p>
            </div>

            <Link
              href="/login?redirect=/dashboard"
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-colors mt-2"
            >
              <span>Learn more</span>
              <ArrowRightIcon className="w-3 h-3 inline" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};
