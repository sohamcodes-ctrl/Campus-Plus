import React from "react";
import { BrandShieldIcon, MailIcon, PhoneIcon } from "./LandingIcons";

export const LandingFooter: React.FC = () => {
  return (
    <footer id="help" className="bg-[#0A2540] text-slate-300 py-10 sm:py-12 border-t border-[#082038]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-xs">
          {/* Left: Brand Monogram & Mission */}
          <div className="flex items-center space-x-3.5 text-left">
            <BrandShieldIcon className="w-8 h-8 shrink-0 text-white" inverted={true} />
            <div>
              <p className="font-semibold text-white text-sm">
                Campus Plus is built for a better campus experience.
              </p>
              <p className="text-slate-400 mt-0.5">
                Your voice matters. We ensure it leads to action.
              </p>
            </div>
          </div>

          {/* Middle: Need Help */}
          <div className="flex items-center space-x-2.5">
            <MailIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block">Need Help?</span>
              <a
                href="mailto:support@campusplus.edu"
                className="text-white font-medium hover:underline"
              >
                support@campusplus.edu
              </a>
            </div>
          </div>

          {/* Middle-Right: Emergencies */}
          <div className="flex items-center space-x-2.5">
            <PhoneIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block">For Emergencies</span>
              <span className="text-white font-medium">Contact Your Institution</span>
            </div>
          </div>

          {/* Far Right: Copyright */}
          <div className="text-center md:text-right">
            <div className="text-white font-semibold">&copy; 2025 Campus Plus</div>
            <div className="text-slate-400 mt-0.5">All rights reserved.</div>
          </div>
        </div>
      </div>
    </footer>
  );
};
