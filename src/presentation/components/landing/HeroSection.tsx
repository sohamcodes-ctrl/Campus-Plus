import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, UserOutlineIcon } from "./LandingIcons";
import { TrustStrip } from "./TrustStrip";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-r from-[#F0F5FD] via-[#F3F7FD] to-[#EAF2FC] overflow-hidden pt-8 sm:pt-12 pb-16 lg:pb-20">
      {/* Integrated Campus Building Visual on the Right (Fading seamlessly to the left) */}
      <div
        className="hidden lg:block absolute top-0 right-0 bottom-0 w-[55%] pointer-events-none overflow-hidden select-none z-0"
        aria-hidden="true"
      >
        <div
          className="w-full h-full relative"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 26%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 26%)",
          }}
        >
          <Image
            src="/images/campus-hero.jpg"
            alt=""
            fill
            priority
            sizes="55vw"
            className="object-cover object-right"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-xl lg:max-w-2xl">
          {/* Two-Line Headline */}
          <h1 className="text-slate-900 font-extrabold text-3xl sm:text-4xl lg:text-[46px] leading-[1.12] tracking-tight">
            One Campus.<br />
            One Accountable System.
          </h1>

          {/* Supporting Paragraph */}
          <p className="mt-4 text-slate-600 text-sm sm:text-[15px] leading-relaxed max-w-lg">
            Campus Plus is the official platform for lodging, tracking, and
            resolving grievances with clarity, accountability, and transparency.
          </p>

          {/* CTA Buttons Row */}
          <div className="mt-6 sm:mt-7 flex flex-wrap items-center gap-3.5">
            <Link
              href="/login?redirect=/complaints/new"
              className="px-5 py-2.5 rounded-md bg-[#0B3C78] hover:bg-[#082C59] text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3C78]"
            >
              <span>Submit a Complaint</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/login"
              className="px-5 py-2.5 rounded-md bg-white hover:bg-slate-50 border border-[#0B3C78] text-[#0B3C78] font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3C78]"
            >
              <span>Sign In to Your Account</span>
              <UserOutlineIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Trust Strip */}
          <TrustStrip />
        </div>

        {/* Mobile/Tablet Fallback Image */}
        <div className="mt-8 lg:hidden rounded-lg overflow-hidden border border-slate-200/60 shadow-sm max-w-md mx-auto">
          <Image
            src="/images/campus-hero.jpg"
            alt="Campus Plus Institutional Campus"
            width={516}
            height={260}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </section>
  );
};
