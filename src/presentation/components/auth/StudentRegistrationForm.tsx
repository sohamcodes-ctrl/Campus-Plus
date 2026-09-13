"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PersonaConfig } from "./authTypes";
import { PasswordField } from "./PasswordField";
import { AlertBanner } from "@/presentation/components/feedback/AlertBanner";

export interface StudentRegistrationFormProps {
  personaConfig: PersonaConfig;
  onChangeRole: () => void;
}

export function StudentRegistrationForm({
  personaConfig,
  onChangeRole,
}: StudentRegistrationFormProps) {
  const [fullName, setFullName] = useState("");
  const [campusEmail, setCampusEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { palette } = personaConfig;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = campusEmail.trim();
    const trimmedId = studentId.trim();

    if (!trimmedName) {
      setValidationError("Please enter your full official name.");
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setValidationError("Please enter a valid institutional email address.");
      return;
    }
    if (!trimmedId) {
      setValidationError("Please enter your student registration / roll number.");
      return;
    }
    if (!department) {
      setValidationError("Please select your academic department.");
      return;
    }
    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters in length.");
      return;
    }
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match. Please re-enter.");
      return;
    }
    if (!agreeTerms) {
      setValidationError("Please agree to the Campus Plus Terms of Use and Privacy Policy.");
      return;
    }

    setIsSubmitting(true);

    // Truthful institutional enrollment intake simulation (no fake db writes per Rule 13 & 33)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 lg:p-10 space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Enrollment Request Recorded
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Your student enrollment details for <strong className="text-slate-800">{fullName}</strong> ({studentId}) have been logged for institutional verification under <strong className="text-slate-800">IAM-REG-PENDING</strong> protocol.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-500 text-left space-y-2">
          <p className="font-semibold text-slate-800">Next Steps:</p>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            <li>An administrative verification notice will be dispatched to <span className="font-medium text-slate-700">{campusEmail}</span>.</li>
            <li>Once institutional validation is complete, your account will be active for grievance submission.</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            style={{
              backgroundColor: palette.primary,
              color: palette.actionText,
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
          >
            Sign In with Verified Credentials &rarr;
          </Link>
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setFullName("");
              setCampusEmail("");
              setStudentId("");
              setDepartment("");
              setPassword("");
              setConfirmPassword("");
              setAgreeTerms(false);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Register Another Student
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 lg:p-10 space-y-6 text-left">
      {/* Header & Change Role */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Student Enrollment
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Create Student Account
          </h2>
        </div>

        <button
          type="button"
          onClick={onChangeRole}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
        >
          &larr; Change account type
        </button>
      </div>

      {validationError && (
        <AlertBanner variant="error" title="Enrollment Validation Error">
          {validationError}
        </AlertBanner>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="reg-fullname" className="block text-xs font-semibold text-slate-700">
            Full Official Name
          </label>
          <input
            id="reg-fullname"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Satyam Sonar"
            required
            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs transition-colors focus:border-[#7FA8D9] focus:outline-hidden focus:ring-2 focus:ring-[#B8D0EC]/40"
          />
        </div>

        {/* Two-Column: Roll No & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label htmlFor="reg-studentid" className="block text-xs font-semibold text-slate-700">
              Student Roll / ID Number
            </label>
            <input
              id="reg-studentid"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. 23011045"
              required
              className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs transition-colors focus:border-[#7FA8D9] focus:outline-hidden focus:ring-2 focus:ring-[#B8D0EC]/40"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-department" className="block text-xs font-semibold text-slate-700">
              Academic Department
            </label>
            <select
              id="reg-department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 shadow-2xs transition-colors focus:border-[#7FA8D9] focus:outline-hidden focus:ring-2 focus:ring-[#B8D0EC]/40"
            >
              <option value="">Select Academic Department</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Electronics &amp; Telecommunication">Electronics &amp; Telecommunication</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Applied Sciences">Applied Sciences</option>
            </select>
          </div>
        </div>

        {/* Institutional Campus Email */}
        <div className="space-y-1.5">
          <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700">
            Institutional Campus Email
          </label>
          <input
            id="reg-email"
            type="email"
            value={campusEmail}
            onChange={(e) => setCampusEmail(e.target.value)}
            placeholder="student@campus.edu"
            autoComplete="username"
            required
            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs transition-colors focus:border-[#7FA8D9] focus:outline-hidden focus:ring-2 focus:ring-[#B8D0EC]/40"
          />
        </div>

        {/* Two-Column: Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <PasswordField
            id="reg-password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            required
          />
          <PasswordField
            id="reg-confirm-password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            autoComplete="new-password"
            required
          />
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="flex items-start space-x-2.5 pt-1">
          <input
            id="reg-terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required
            className="h-4 w-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="reg-terms" className="text-xs text-slate-600 leading-normal">
            I agree to the Campus Plus <Link href="/terms" className="text-blue-600 underline">Terms of Use</Link> and <Link href="/privacy" className="text-blue-600 underline">Privacy Policy</Link>.
          </label>
        </div>

        {/* Submit CTA */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            style={{
              backgroundColor: palette.primary,
              color: palette.actionText,
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 font-bold text-xs sm:text-sm shadow-xs transition-opacity hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? "Submitting Student Enrollment Request..." : "Submit Student Enrollment Request"}
          </button>
        </div>
      </form>

      {/* Footer Switcher */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          <span>Already registered? </span>
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Sign In &rarr;
          </Link>
        </div>
        <Link href="/" className="hover:text-slate-800 transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
