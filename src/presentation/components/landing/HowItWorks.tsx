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
      icon: <FileEditIcon className="w-5 h-5 text-blue-600" />,
      circleBg: "bg-blue-50",
    },
    {
      num: "2. Review",
      desc: "The complaint is reviewed by the concerned authority.",
      icon: <SearchCheckIcon className="w-5 h-5 text-emerald-600" />,
      circleBg: "bg-emerald-50",
    },
    {
      num: "3. Assign",
      desc: "It is assigned to the right department or officer.",
      icon: <UserAssignIcon className="w-5 h-5 text-purple-600" />,
      circleBg: "bg-purple-50",
    },
    {
      num: "4. Track",
      desc: "Track progress in real-time with full transparency.",
      icon: <CogTrackIcon className="w-5 h-5 text-amber-600" />,
      circleBg: "bg-amber-50",
    },
    {
      num: "5. Resolve & Verify",
      desc: "Resolution is verified and the grievance is closed.",
      icon: <ShieldCheckIcon className="w-5 h-5 text-rose-600" />,
      circleBg: "bg-rose-50",
    },
  ];

  return (
    <section id="how-it-works" className="pt-16 pb-12 sm:pt-20 sm:pb-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center scroll-mt-20">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-10 sm:mb-12">
        How It Works
      </h2>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-2">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center text-center w-36 sm:w-40">
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${step.circleBg} flex items-center justify-center mb-3 shadow-2xs`}
              >
                {step.icon}
              </div>
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 mb-1">
                {step.num}
              </h3>
              <p className="text-[11px] text-slate-500 leading-snug">
                {step.desc}
              </p>
            </div>

            {/* Connecting arrow between steps */}
            {idx < steps.length - 1 && (
              <div className="hidden lg:flex text-slate-300 self-center -mt-5" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};
