import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import RootPage from "@/app/page";
import { UserRole } from "@/domain/complaint";

const mockReplace = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

let mockAuthState = "UNAUTHENTICATED";
let mockAuthError: string | null = null;
const mockRefreshActor = vi.fn();

vi.mock("@/presentation/context/AuthContext", () => ({
  useAuth: () => ({
    authState: mockAuthState,
    error: mockAuthError,
    refreshActor: mockRefreshActor,
    user: mockAuthState === "AUTHENTICATED" ? { id: "u-1", email: "student@campus.edu" } : null,
    actor: mockAuthState === "AUTHENTICATED" ? { userId: "u-1", role: UserRole.ROLE_STUDENT, departmentId: null } : null,
    role: mockAuthState === "AUTHENTICATED" ? UserRole.ROLE_STUDENT : null,
    departmentId: null,
    isAuthenticated: mockAuthState === "AUTHENTICATED",
    isLoading: mockAuthState === "INITIALIZING",
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

describe("Public Landing Page Pixel-Accurate Reference Specification ('/')", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = "UNAUTHENTICATED";
    mockAuthError = null;
  });

  it("1. renders institutional header with brand shield, wordmark, tagline, navigation, and auth CTAs", () => {
    const html = renderToStaticMarkup(React.createElement(RootPage));
    expect(html).contain("Campus Plus");
    expect(html).contain("Accountable. Transparent. Together.");
    expect(html).contain("Home");
    expect(html).contain("How It Works");
    expect(html).contain("Roles");
    expect(html).contain("Transparency");
    expect(html).contain("Help &amp; Support");
    expect(html).contain('href="/login"');
    expect(html).contain('href="/register"');
  });

  it("2. renders hero section with exact two-line headline, description, CTAs, and campus photo", () => {
    const html = renderToStaticMarkup(React.createElement(RootPage));
    expect(html).contain("One Campus.");
    expect(html).contain("One Accountable System.");
    expect(html).contain("Campus Plus is the official platform for lodging, tracking, and resolving grievances with clarity, accountability, and transparency.");
    expect(html).contain("Submit a Complaint");
    expect(html).contain("Sign In to Your Account");
    expect(html).contain('href="/login?redirect=/complaints/new"');
    expect(html).contain('href="/login"');
    expect(html).contain("campus-hero.jpg");
  });

  it("3. renders trust strip with four institutional value propositions", () => {
    const html = renderToStaticMarkup(React.createElement(RootPage));
    expect(html).contain("Secure &amp; Role-based");
    expect(html).contain("Access Control");
    expect(html).contain("Track Every Step");
    expect(html).contain("in Real-time");
    expect(html).contain("Transparency");
    expect(html).contain("You Can Trust");
    expect(html).contain("Institutional");
    expect(html).contain("Accountability");
  });

  it("4. renders floating metrics bar with four statistics and honest data disclosure", () => {
    const html = renderToStaticMarkup(React.createElement(RootPage));
    expect(html).contain("2,482");
    expect(html).contain("Complaints Registered");
    expect(html).contain("1,842");
    expect(html).contain("Resolved");
    expect(html).contain("98%");
    expect(html).contain("Actioned in Time");
    expect(html).contain("100%");
    expect(html).contain("Data Confidentiality");
    expect(html).contain("Illustrative Metrics");
  });

  it("5. renders How It Works with exact five-step horizontal process", () => {
    const html = renderToStaticMarkup(React.createElement(RootPage));
    expect(html).contain("How It Works");
    expect(html).contain("1. Submit");
    expect(html).contain("Raise your complaint in a few simple steps.");
    expect(html).contain("2. Review");
    expect(html).contain("The complaint is reviewed by the concerned authority.");
    expect(html).contain("3. Assign");
    expect(html).contain("It is assigned to the right department or officer.");
    expect(html).contain("4. Track");
    expect(html).contain("Track progress in real-time with full transparency.");
    expect(html).contain("5. Resolve &amp; Verify");
    expect(html).contain("Resolution is verified and the grievance is closed.");
  });

  it("6. renders Who Can Use Campus Plus with exact six role cards", () => {
    const html = renderToStaticMarkup(React.createElement(RootPage));
    expect(html).contain("Who Can Use Campus Plus");
    expect(html).contain("Students");
    expect(html).contain("Submit grievances and track resolution progress.");
    expect(html).contain("Faculty / Handlers");
    expect(html).contain("Review, assign and resolve grievances efficiently.");
    expect(html).contain("HODs");
    expect(html).contain("Oversee departmental grievances and escalations.");
    expect(html).contain("Directors / Authorities");
    expect(html).contain("Monitor escalated issues and ensure accountability.");
    expect(html).contain("Institutional Management");
    expect(html).contain("Analyze trends and improve institutional processes.");
    expect(html).contain("System Admins");
    expect(html).contain("Maintain system integrity, users and configurations.");
    expect(html).contain("Learn more");
  });

  it("7. renders dark institutional navy footer with contact, emergencies, and copyright", () => {
    const html = renderToStaticMarkup(React.createElement(RootPage));
    expect(html).contain("Campus Plus is built for a better campus experience.");
    expect(html).contain("Your voice matters. We ensure it leads to action.");
    expect(html).contain("Need Help?");
    expect(html).contain("support@campusplus.edu");
    expect(html).contain("For Emergencies");
    expect(html).contain("Contact Your Institution");
    expect(html).contain("© 2025 Campus Plus");
    expect(html).contain("All rights reserved.");
  });

  it("8. authenticated state renders ShellLoading during dashboard transition", () => {
    mockAuthState = "AUTHENTICATED";
    const html = renderToStaticMarkup(React.createElement(RootPage));
    expect(html).contain('role="status"');
    expect(html).contain("Verifying your campus access");
  });
});
