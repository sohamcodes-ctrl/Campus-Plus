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
      icon: <StudentCapIcon className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      title: "Faculty / Handlers",
      desc: "Review, assign and resolve grievances efficiently.",
      icon: <FacultyUserIcon className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      title: "HODs",
      desc: "Oversee departmental grievances and escalations.",
      icon: <PillarBuildingIcon className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-50",
    },
    {
      title: "Directors / Authorities",
      desc: "Monitor escalated issues and ensure accountability.",
      icon: <ShieldStarIcon className="w-5 h-5 text-blue-800" />,
      bg: "bg-blue-50",
    },
    {
      title: "Institutional Management",
      desc: "Analyze trends and improve institutional processes.",
      icon: <UsersGroupIcon className="w-5 h-5 text-rose-600" />,
      bg: "bg-rose-50",
    },
    {
      title: "System Admins",
      desc: "Maintain system integrity, users and configurations.",
      icon: <AdminGearShieldIcon className="w-5 h-5 text-slate-700" />,
      bg: "bg-slate-100",
    },
  ];

  return (
    <section id="roles" className="pt-16 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center scroll-mt-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-12">
        Who Can Use Campus Plus
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-5 text-left">
        {roles.map((r, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div
                className={`w-10 h-10 rounded-lg ${r.bg} flex items-center justify-center mb-4`}
              >
                {r.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">
                {r.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                {r.desc}
              </p>
            </div>

            <Link
              href="/login?redirect=/dashboard"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-colors"
            >
              <span>Learn more</span>
              <ArrowRightIcon className="w-3.5 h-3.5 inline" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};
