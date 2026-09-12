import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, UserOutlineIcon } from "./LandingIcons";
import { TrustStrip } from "./TrustStrip";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-r from-[#F0F5FD] via-[#F4F8FD] to-[#F8FAFC] overflow-hidden pt-10 sm:pt-14 pb-20 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 z-10">
            <h1 className="text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-[52px] leading-[1.12] tracking-tight">
              One Campus.<br />
              One Accountable System.
            </h1>

            <p className="mt-5 text-slate-600 text-base sm:text-[17px] leading-relaxed max-w-xl">
              Campus Plus is the official platform for lodging, tracking, and
              resolving grievances with clarity, accountability, and transparency.
            </p>

            {/* CTA Buttons Row */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/login?redirect=/complaints/new"
                className="px-6 py-3.5 rounded-md bg-[#0B3C78] hover:bg-[#082C59] text-white font-semibold text-sm sm:text-base flex items-center space-x-2.5 shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3C78]"
              >
                <span>Submit a Complaint</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>

              <Link
                href="/login"
                className="px-6 py-3.5 rounded-md bg-white hover:bg-slate-50 border border-[#0B3C78] text-[#0B3C78] font-semibold text-sm sm:text-base flex items-center space-x-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3C78]"
              >
                <span>Sign In to Your Account</span>
                <UserOutlineIcon className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust Strip */}
            <TrustStrip />
          </div>

          {/* Right Column: Institutional Campus Building Visual */}
          <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[560px] rounded-xl overflow-hidden shadow-lg border border-slate-200/60">
              <Image
                src="/images/campus-hero.jpg"
                alt="Campus Plus Institutional Building and Commitment"
                width={560}
                height={280}
                priority
                className="w-full h-auto object-cover object-center"
              />
              {/* Soft fade overlay on left edge to blend seamlessly */}
              <div
                className="absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-[#F0F5FD] to-transparent pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
