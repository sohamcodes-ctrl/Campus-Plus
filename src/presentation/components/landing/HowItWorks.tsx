import React from "react";
import {
  FileEditIcon,
  SearchCheckIcon,
  UserAssignIcon,
  CogTrackIcon,
  ShieldCheckIcon,
} from "./LandingIcons";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: "1. Submit",
      desc: "Raise your complaint in a few simple steps.",
      icon: <FileEditIcon className="w-6 h-6 text-blue-600" />,
      circleBg: "bg-blue-50",
    },
    {
      num: "2. Review",
      desc: "The complaint is reviewed by the concerned authority.",
      icon: <SearchCheckIcon className="w-6 h-6 text-emerald-600" />,
      circleBg: "bg-emerald-50",
    },
    {
      num: "3. Assign",
      desc: "It is assigned to the right department or officer.",
      icon: <UserAssignIcon className="w-6 h-6 text-purple-600" />,
      circleBg: "bg-purple-50",
    },
    {
      num: "4. Track",
      desc: "Track progress in real-time with full transparency.",
      icon: <CogTrackIcon className="w-6 h-6 text-amber-600" />,
      circleBg: "bg-amber-50",
    },
    {
      num: "5. Resolve & Verify",
      desc: "Resolution is verified and the grievance is closed.",
      icon: <ShieldCheckIcon className="w-6 h-6 text-rose-600" />,
      circleBg: "bg-rose-50",
    },
  ];

  return (
    <section id="how-it-works" className="pt-24 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center scroll-mt-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-14">
        How It Works
      </h2>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-3">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center text-center max-w-[200px]">
              <div
                className={`w-14 h-14 rounded-full ${step.circleBg} flex items-center justify-center mb-3.5 shadow-2xs`}
              >
                {step.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {step.num}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {step.desc}
              </p>
            </div>

            {/* Connecting arrow between steps */}
            {idx < steps.length - 1 && (
              <div className="hidden lg:flex text-slate-300 self-center -mt-6" aria-hidden="true">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};
