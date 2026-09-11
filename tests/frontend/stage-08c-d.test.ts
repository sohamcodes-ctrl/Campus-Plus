import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Security utilities
import {
  isValidInternalRedirect,
  sanitizeRedirect,
  validateRouteId,
} from "@/presentation/utils/security";

// Navigation
import {
  getNavigationItemsForRole,
  formatRoleLabel,
  ALL_ROLES,
  COMPLAINANT_ROLES,
} from "@/presentation/navigation/navigationConfig";

// Domain
import { UserRole } from "@/domain/complaint";

// Shell components
import { Breadcrumbs } from "@/presentation/components/shell/Breadcrumbs";
import { TopBar } from "@/presentation/components/shell/TopBar";
import { Sidebar } from "@/presentation/components/shell/Sidebar";
import { MobileNav } from "@/presentation/components/shell/MobileNav";
import { ForbiddenState } from "@/presentation/components/shell/ForbiddenState";
import { ShellLoading } from "@/presentation/components/shell/ShellLoading";
import { ShellError } from "@/presentation/components/shell/ShellError";
import { AppShell } from "@/presentation/components/shell/AppShell";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock AuthContext
vi.mock("@/presentation/context/AuthContext", () => ({
  useAuth: () => ({
    authState: "AUTHENTICATED",
    user: { id: "user-123", email: "student@campus.edu" },
    actor: { userId: "user-123", role: "ROLE_STUDENT", departmentId: null },
    role: "ROLE_STUDENT",
    departmentId: null,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    refreshActor: vi.fn(),
  }),
  ROLE_THEMES: {
    ROLE_STUDENT: { primary: "#7FA8D9", btnText: "#1E3A5F" },
  },
}));

describe("Stage 08-C-D: Application Shell, Routing & Security Foundation Suite", () => {
  // ==========================================================================
  // 1. OPEN REDIRECT & SECURITY UTILITY VERIFICATION (CWE-601)
  // ==========================================================================
  describe("1. Open Redirect & Parameter Security (security.ts)", () => {
    it("accepts valid internal paths for redirection", () => {
      expect(isValidInternalRedirect("/dashboard")).toBe(true);
      expect(isValidInternalRedirect("/complaints/new")).toBe(true);
      expect(isValidInternalRedirect("/complaints/c-uuid-123")).toBe(true);
      expect(isValidInternalRedirect("/dashboard?tab=triage")).toBe(true);
    });

    it("rejects protocol-relative and external URL redirect vectors", () => {
      expect(isValidInternalRedirect("https://attacker.com")).toBe(false);
      expect(isValidInternalRedirect("http://evil.com/dashboard")).toBe(false);
      expect(isValidInternalRedirect("//attacker.com")).toBe(false);
      expect(isValidInternalRedirect("//evil.com/dashboard")).toBe(false);
      expect(isValidInternalRedirect("/\\attacker.com")).toBe(false);
      expect(isValidInternalRedirect("\\attacker.com")).toBe(false);
    });

    it("rejects javascript: and data: URI scheme injection vectors", () => {
      expect(isValidInternalRedirect("javascript:alert(1)")).toBe(false);
      expect(isValidInternalRedirect("/javascript:alert(1)")).toBe(false);
      expect(isValidInternalRedirect("data:text/html,<script>evil()</script>")).toBe(false);
    });

    it("rejects null, undefined, empty, and non-whitelisted paths", () => {
      expect(isValidInternalRedirect(null)).toBe(false);
      expect(isValidInternalRedirect(undefined)).toBe(false);
      expect(isValidInternalRedirect("")).toBe(false);
      expect(isValidInternalRedirect("/unauthorized-admin-route")).toBe(false);
    });

    it("sanitizeRedirect returns fallback when vector is rejected", () => {
      expect(sanitizeRedirect("https://malicious.org", "/dashboard")).toBe("/dashboard");
      expect(sanitizeRedirect("//evil.com", "/dashboard")).toBe("/dashboard");
      expect(sanitizeRedirect("/dashboard?tab=worklist", "/dashboard")).toBe("/dashboard?tab=worklist");
    });

    it("validateRouteId strictly validates UUID v4 and Tracking Codes", () => {
      const validUuid = "123e4567-e89b-12d3-a456-426614174000";
      const validCode = "CP-2026-00042";

      const resUuid = validateRouteId(validUuid);
      expect(resUuid.isValid).toBe(true);
      expect(resUuid.type).toBe("uuid");

      const resCode = validateRouteId(validCode);
      expect(resCode.isValid).toBe(true);
      expect(resCode.type).toBe("trackingCode");

      // Injection vectors
      expect(validateRouteId("' OR 1=1 --").isValid).toBe(false);
      expect(validateRouteId("../../../etc/passwd").isValid).toBe(false);
      expect(validateRouteId("<script>alert(1)</script>").isValid).toBe(false);
      expect(validateRouteId("").isValid).toBe(false);
      expect(validateRouteId(null).isValid).toBe(false);
    });
  });

  // ==========================================================================
  // 2. ROLE-AWARE NAVIGATION FILTERING
  // ==========================================================================
  describe("2. Role-Aware Navigation Filtering (navigationConfig.ts)", () => {
    it("filters navigation items strictly by authenticated actor role", () => {
      const studentItems = getNavigationItemsForRole(UserRole.ROLE_STUDENT);
      const studentIds = studentItems.map((i) => i.id);
      expect(studentIds).toContain("nav-dashboard");
      expect(studentIds).toContain("nav-new-complaint");
      expect(studentIds).not.toContain("nav-triage");
      expect(studentIds).not.toContain("nav-worklist");
      expect(studentIds).not.toContain("nav-analytics");

      const handlerItems = getNavigationItemsForRole(UserRole.ROLE_HANDLER);
      const handlerIds = handlerItems.map((i) => i.id);
      expect(handlerIds).toContain("nav-dashboard");
      expect(handlerIds).toContain("nav-worklist");
      expect(handlerIds).not.toContain("nav-new-complaint");
      expect(handlerIds).not.toContain("nav-analytics");

      const hodItems = getNavigationItemsForRole(UserRole.ROLE_DEPT_HEAD);
      const hodIds = hodItems.map((i) => i.id);
      expect(hodIds).toContain("nav-dashboard");
      expect(hodIds).toContain("nav-triage");
      expect(hodIds).toContain("nav-worklist");
      expect(hodIds).toContain("nav-escalations");
      expect(hodIds).not.toContain("nav-new-complaint");

      const mgtItems = getNavigationItemsForRole(UserRole.ROLE_MANAGEMENT);
      const mgtIds = mgtItems.map((i) => i.id);
      expect(mgtIds).toContain("nav-dashboard");
      expect(mgtIds).toContain("nav-escalations");
      expect(mgtIds).toContain("nav-analytics");
      expect(mgtIds).not.toContain("nav-new-complaint");
      expect(mgtIds).not.toContain("nav-triage");
    });

    it("returns empty navigation list when role is null or unauthenticated", () => {
      expect(getNavigationItemsForRole(null)).toEqual([]);
    });

    it("formats raw roles into clean institutional labels", () => {
      expect(formatRoleLabel(UserRole.ROLE_STUDENT)).toBe("Student");
      expect(formatRoleLabel(UserRole.ROLE_FACULTY)).toBe("Faculty");
      expect(formatRoleLabel(UserRole.ROLE_HANDLER)).toBe("Complaint Handler");
      expect(formatRoleLabel(UserRole.ROLE_DEPT_HEAD)).toBe("Department Head");
      expect(formatRoleLabel(UserRole.ROLE_ADMIN)).toBe("Administrator");
      expect(formatRoleLabel(UserRole.ROLE_MANAGEMENT)).toBe("Executive Management");
      expect(formatRoleLabel(null)).toBe("Guest");
    });

    it("exposes locked role arrays matching institutional domain model", () => {
      expect(ALL_ROLES).toHaveLength(6);
      expect(ALL_ROLES).toContain(UserRole.ROLE_STUDENT);
      expect(ALL_ROLES).toContain(UserRole.ROLE_FACULTY);
      expect(ALL_ROLES).toContain(UserRole.ROLE_HANDLER);
      expect(ALL_ROLES).toContain(UserRole.ROLE_DEPT_HEAD);
      expect(ALL_ROLES).toContain(UserRole.ROLE_ADMIN);
      expect(ALL_ROLES).toContain(UserRole.ROLE_MANAGEMENT);

      expect(COMPLAINANT_ROLES).toEqual([UserRole.ROLE_STUDENT, UserRole.ROLE_FACULTY]);
    });
  });

  // ==========================================================================
  // 3. APPLICATION SHELL & PRESENTATION FOUNDATION
  // ==========================================================================
  describe("3. Application Shell Components", () => {
    it("AppShell renders skip navigation link, TopBar, Sidebar, and main container", () => {
      const html = renderToStaticMarkup(
        React.createElement(AppShell, null, React.createElement("div", { id: "child" }, "Page Content"))
      );
      // WCAG Skip Link
      expect(html).toContain("Skip to main content");
      expect(html).toContain('href="#main-content"');
      // Main landmark
      expect(html).toContain('id="main-content"');
      expect(html).toContain('tabindex="-1"');
      // Content preservation
      expect(html).toContain("Page Content");
    });

    it("TopBar renders role brand bar, system title, and role badge", () => {
      const html = renderToStaticMarkup(React.createElement(TopBar, null));
      expect(html).toContain("Campus Plus");
      expect(html).toContain("bg-[var(--role-primary,#7FA8D9)]");
      expect(html).toContain("Student");
      expect(html).toContain('aria-label="View notifications"');
    });

    it("Sidebar renders navigation items with active route highlighting", () => {
      const html = renderToStaticMarkup(React.createElement(Sidebar, null));
      expect(html).toContain('aria-label="Main Navigation"');
      expect(html).toContain("Dashboard");
      expect(html).toContain("New Grievance");
      expect(html).toContain('aria-current="page"');
    });

    it("MobileNav renders mobile navigation bar with 44px tap target semantics", () => {
      const html = renderToStaticMarkup(React.createElement(MobileNav, null));
      expect(html).toContain('aria-label="Mobile Navigation"');
      expect(html).toContain("Dashboard");
      expect(html).toContain("More");
      expect(html).toContain("min-h-[44px]");
    });

    it("Breadcrumbs renders semantic navigation with home link", () => {
      const html = renderToStaticMarkup(React.createElement(Breadcrumbs, null));
      expect(html).toContain('aria-label="Breadcrumb"');
      expect(html).toContain("Home");
      expect(html).toContain("Dashboard");
    });

    it("ForbiddenState renders 403 Access Denied without leaking sensitive data", () => {
      const html = renderToStaticMarkup(React.createElement(ForbiddenState, null));
      expect(html).toContain("403 — Access Denied");
      expect(html).toContain("Return to Dashboard");
      expect(html).toContain("Current Role: Student");
    });

    it("ShellLoading renders accessible status announcement", () => {
      const html = renderToStaticMarkup(React.createElement(ShellLoading, null));
      expect(html).toContain('role="status"');
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain("Verifying your campus access…");
    });

    it("ShellError renders safe diagnostic message and retry action", () => {
      const html = renderToStaticMarkup(
        React.createElement(ShellError, {
          error: "Network connection was interrupted.",
          onRetry: () => {},
        })
      );
      expect(html).toContain("Campus Plus Session Error");
      expect(html).toContain("Network connection was interrupted.");
      expect(html).toContain("Retry Connection");
    });
  });
});
