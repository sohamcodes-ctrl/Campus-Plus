"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TextInput } from "@/presentation/components/forms/TextInput";
import { Button } from "@/presentation/components/primitives/Button";
import { AlertBanner } from "@/presentation/components/feedback/AlertBanner";

export default function RegisterPage() {
  const [personaType, setPersonaType] = useState<"student" | "staff">("student");

  // Student intake form state
  const [fullName, setFullName] = useState("");
  const [campusEmail, setCampusEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate fields
    if (!fullName.trim()) {
      setValidationError("Please enter your full official name.");
      return;
    }
    if (!campusEmail.trim() || !campusEmail.includes("@")) {
      setValidationError("Please enter a valid institutional email address.");
      return;
    }
    if (!studentId.trim()) {
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

    setIsSubmitting(true);

    // Simulate validation and display truthful institutional enrollment response
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-slate-200">
      {/* 3px Brand Accent */}
      <div className="h-[3px] w-full bg-[#7FA8D9]" aria-hidden="true" />

      {/* Institutional Top Navigation Bar */}
      <header className="w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xs py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7FA8D9] text-[#1E3A5F] font-bold text-base shadow-xs ring-1 ring-black/5">
              C+
            </div>
            <div>
              <span className="font-semibold tracking-tight text-slate-900 text-base">Campus Plus</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-normal text-slate-500 border-l border-slate-200 pl-2">
                Account Enrollment &amp; Provisioning
              </span>
            </div>
          </Link>
          <div className="flex items-center space-x-4 text-xs">
            <span className="text-slate-500">Already registered?</span>
            <Link
              href="/login"
              className="font-semibold text-[#1E3A5F] hover:underline"
            >
              Sign In &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Context and Role Guidance */}
          <div className="lg:col-span-5 space-y-5 text-slate-900">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF2FB] text-[#1E3A5F] border border-[#B8D0EC]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7FA8D9]" aria-hidden="true"></span>
              Identity &amp; Access Governance
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Create Your Account
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Campus Plus enforces role-scoped identity governance. Choose your institutional affiliation to proceed.
              </p>
            </div>

            {/* Persona Switcher Tabs */}
            <div className="bg-slate-200/70 p-1 rounded-xl flex text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setPersonaType("student"); setIsSubmitted(false); setValidationError(null); }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  personaType === "student"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Student / Complainant
              </button>
              <button
                type="button"
                onClick={() => { setPersonaType("staff"); setIsSubmitted(false); setValidationError(null); }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  personaType === "staff"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Faculty / Staff / HOD
              </button>
            </div>

            {/* Persona Guidance Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-3 shadow-2xs">
              {personaType === "student" ? (
                <>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#7FA8D9]" />
                    Student Self-Service Enrollment
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Students can enroll using their campus-issued institutional email. Your registration is validated against active registrar rolls to grant complainant access.
                  </p>
                  <ul className="text-slate-500 space-y-1 pl-3 list-disc">
                    <li>Submit and track grievances</li>
                    <li>Exercise 5-day verification sign-off</li>
                    <li>Dispute unresolved complaints</li>
                  </ul>
                </>
              ) : (
                <>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#7FC4B2]" />
                    Institutional Staff Provisioning
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Faculty, Department Handlers, Department Heads (HOD), and Senior Management accounts cannot be self-registered to prevent unauthorized role elevation.
                  </p>
                  <ul className="text-slate-500 space-y-1 pl-3 list-disc">
                    <li>Departmental assignment bounds</li>
                    <li>Triage and resolution authority</li>
                    <li>Auditable lifecycle actions</li>
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Form or Staff Provisioning Notice */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              {personaType === "student" ? (
                <>
                  {isSubmitted ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Enrollment Request Received
                      </h2>
                      <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                        Thank you, <strong>{fullName}</strong>. Your enrollment request for <strong>{campusEmail}</strong> has been received. Your campus credentials will be activated once verified against the student registrar database.
                      </p>
                      <div className="pt-2">
                        <Link
                          href="/login"
                          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#1E3A5F] text-white hover:bg-[#152840] transition-colors"
                        >
                          Return to Sign In
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-base font-bold text-slate-900">
                          Student Registration Intake
                        </h2>
                        <p className="text-xs text-slate-500">
                          Please enter your official academic details.
                        </p>
                      </div>

                      {validationError && (
                        <AlertBanner variant="error" title="Validation Error">
                          {validationError}
                        </AlertBanner>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <TextInput
                            label="Full Official Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Alex Johnson"
                            required
                          />
                        </div>
                        <div>
                          <TextInput
                            label="Student Roll / ID Number"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="e.g. STU-2026-0421"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <TextInput
                          label="Institutional Campus Email"
                          type="email"
                          value={campusEmail}
                          onChange={(e) => setCampusEmail(e.target.value)}
                          placeholder="e.g. student.a@campus.edu"
                          required
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Must be your official university domain email.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Academic Department
                        </label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7FA8D9] focus:outline-hidden focus:ring-1 focus:ring-[#7FA8D9]"
                          required
                        >
                          <option value="">Select your department...</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Computer Science">Computer Science &amp; Engineering</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Civil Engineering">Civil Engineering</option>
                          <option value="Sciences & Humanities">Sciences &amp; Humanities</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <TextInput
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                            required
                          />
                        </div>
                        <div>
                          <TextInput
                            label="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            required
                          />
                        </div>
                      </div>

                      <div className="pt-3">
                        <Button
                          type="submit"
                          variant="primary"
                          size="md"
                          className="w-full font-semibold shadow-xs"
                          isLoading={isSubmitting}
                          disabled={isSubmitting}
                        >
                          Submit Student Enrollment Request
                        </Button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                /* Staff & Administrative Provisioning Guidance */
                <div className="space-y-4 py-2">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-slate-900">
                      Institutional Directory Provisioning
                    </h2>
                    <p className="text-xs text-slate-500">
                      Standard operating procedure for faculty and departmental officers.
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-4 text-xs text-amber-900 space-y-2">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>Self-Registration Restricted by Policy</span>
                    </div>
                    <p className="leading-relaxed">
                      In accordance with institutional security policies (SEC-002, PRIV-001), faculty, handler, HOD, and administrative permissions cannot be self-claimed. Privileged accounts are provisioned exclusively through verified institutional channels.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs text-slate-600">
                    <h3 className="font-bold text-slate-800">
                      How to Request Access:
                    </h3>
                    <div className="space-y-2 border-l-2 border-slate-200 pl-3">
                      <div>
                        <strong>1. Faculty Members &amp; Handlers:</strong>
                        <p className="text-slate-500">Contact your Department Head or department administrator to be assigned as a designated complaint handler.</p>
                      </div>
                      <div>
                        <strong>2. Department Heads (HOD):</strong>
                        <p className="text-slate-500">Appointment letters must be verified by the Office of the Dean / Academic Director.</p>
                      </div>
                      <div>
                        <strong>3. Senior Management &amp; IT Admin:</strong>
                        <p className="text-slate-500">Provisioned directly by the Central Campus IT Directorate.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500">Already provisioned with credentials?</span>
                    <Link
                      href="/login"
                      className="px-4 py-2 bg-[#1E3A5F] text-white rounded-lg font-semibold hover:bg-[#152840] transition-colors"
                    >
                      Sign In Now
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white/70 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Campus Plus — Campus Complaint &amp; Grievance Resolution System</span>
          <span>Role-Based Access Control • Institutional IAM Compliance</span>
        </div>
      </footer>
    </div>
  );
}
