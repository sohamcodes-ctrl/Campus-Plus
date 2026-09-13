import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Components under test
import { StudentDashboard } from "@/presentation/components/dashboard/StudentDashboard";
import { StudentActionRequiredBanner } from "@/presentation/components/dashboard/student/StudentActionRequiredBanner";
import { HandlerDashboard } from "@/presentation/components/dashboard/HandlerDashboard";
import { HodDashboard } from "@/presentation/components/dashboard/HodDashboard";
import { ManagementDashboard } from "@/presentation/components/dashboard/ManagementDashboard";
import { AdminDashboard } from "@/presentation/components/dashboard/AdminDashboard";

// Domain & Types
import { UserRole } from "@/domain/complaint";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/dashboard",
}));

// Mock AuthContext
let mockRole: string = UserRole.ROLE_STUDENT;
const mockUserId: string = "user-123";
let mockDeptId: string | null = null;

vi.mock("@/presentation/context/AuthContext", () => ({
  useAuth: () => ({
    authState: "AUTHENTICATED",
    user: { id: mockUserId, email: "user@campusplus.internal" },
    actor: { userId: mockUserId, role: mockRole, departmentId: mockDeptId },
    role: mockRole,
    departmentId: mockDeptId,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    refreshActor: vi.fn(),
  }),
}));

const { sampleComplaints } = vi.hoisted(() => {
  return {
    sampleComplaints: [
      {
        id: "c-1",
        trackingCode: "CP-2026-00001",
        title: "Wi-Fi outage in Lab 3",
        description: "Connectivity drops continuously during lab hours.",
        categoryId: "NETWORK_WIFI",
        departmentId: "00000000-0000-0000-0000-000000000010",
        locationDetails: "Mech Block, 2nd Floor",
        status: "SUBMITTED",
        suggestedPriority: "HIGH",
        officialPriority: "HIGH",
        version: 1,
        isEscalated: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "c-2",
        trackingCode: "CP-2026-00002",
        title: "Broken window in Room 102",
        description: "Window glass is shattered, safety hazard.",
        categoryId: "HOSTEL_MAINTENANCE",
        departmentId: "00000000-0000-0000-0000-000000000020",
        locationDetails: "Hostel Block A",
        status: "RESOLVED",
        suggestedPriority: "MEDIUM",
        officialPriority: "MEDIUM",
        version: 2,
        isEscalated: false,
        assignedHandlerId: "user-123",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resolution: {
          summary: "Replaced glass pane and verified latch.",
          resolvedAt: new Date().toISOString(),
        },
      },
    ],
  };
});

vi.mock("@/presentation/services/apiClient", () => ({
  apiClient: {
    listComplaints: vi.fn().mockResolvedValue({ items: sampleComplaints }),
  },
}));

describe("Phase 08-C: Five Distinct Role Dashboard Experiences Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // 1. STUDENT / COMPLAINANT DASHBOARD (AUTHORITATIVE HIGH-FIDELITY REFERENCE)
  // ==========================================================================
  describe("1. Student Dashboard (ROLE_STUDENT)", () => {
    it("renders student welcome hero with identity greeting and mission quote", () => {
      mockRole = UserRole.ROLE_STUDENT;
      const html = renderToStaticMarkup(React.createElement(StudentDashboard));

      expect(html).toContain("Welcome back,");
      expect(html).toContain("Your voice matters. We are here to listen, act, and resolve.");
      expect(html).toContain("R.C. Patel Institute of Technology");
    });

    it("renders real metrics cards for Total Complaints, In Progress, and Resolved", () => {
      mockRole = UserRole.ROLE_STUDENT;
      const html = renderToStaticMarkup(React.createElement(StudentDashboard));

      expect(html).toContain("Total Complaints");
      expect(html).toContain("You have raised");
      expect(html).toContain("In Progress");
      expect(html).toContain("Currently being handled");
      expect(html).toContain("Resolved");
      expect(html).toContain("Successfully resolved");
    });

    it("renders 'Recent Complaints' table header with Tracking ID, Category, Priority, and Action columns", () => {
      mockRole = UserRole.ROLE_STUDENT;
      const html = renderToStaticMarkup(React.createElement(StudentDashboard));

      expect(html).toContain("Recent Complaints");
      expect(html).toContain("Tracking ID");
      expect(html).toContain("Title");
      expect(html).toContain("Category");
      expect(html).toContain("Priority");
      expect(html).toContain("Status");
      expect(html).toContain("Last Updated");
      expect(html).toContain("Action");
    });

    it("renders Quick Actions card and Announcements section matching reference design", () => {
      mockRole = UserRole.ROLE_STUDENT;
      const html = renderToStaticMarkup(React.createElement(StudentDashboard));

      expect(html).toContain("Quick Actions");
      expect(html).toContain("Submit New Complaint");
      expect(html).toContain("View My Complaints");
      expect(html).toContain("My Verifications");
      expect(html).toContain("View Announcements");
      expect(html).toContain("Announcements");
    });

    it("renders Action Required verification banner conditionally based on pending count", () => {
      // Positive case: pending verification exists
      const htmlWithPending = renderToStaticMarkup(
        React.createElement(StudentActionRequiredBanner, {
          pendingCount: 2,
          firstPendingComplaintId: "c-2",
        })
      );
      expect(htmlWithPending).toContain("Action Required");
      expect(htmlWithPending).toContain("awaiting your verification");
      expect(htmlWithPending).toContain("Review Now");
      expect(htmlWithPending).toContain("/complaints/c-2");

      // Negative case: zero pending verifications (honest omission)
      const htmlZeroPending = renderToStaticMarkup(
        React.createElement(StudentActionRequiredBanner, {
          pendingCount: 0,
        })
      );
      expect(htmlZeroPending).toBe("");
    });
  });

  // ==========================================================================
  // 2. HANDLER WORKSPACE DASHBOARD
  // ==========================================================================
  describe("2. Handler Dashboard (ROLE_HANDLER)", () => {
    it("renders operational work queue with tabbed worklists", () => {
      mockRole = UserRole.ROLE_HANDLER;
      mockDeptId = "00000000-0000-0000-0000-000000000010";
      const html = renderToStaticMarkup(React.createElement(HandlerDashboard));

      expect(html).toContain("Complaint Handler Workspace");
      expect(html).toContain("Operational Queue");
      expect(html).toContain("My Assigned Worklist");
      expect(html).toContain("Department Queue");
    });

    it("displays assigned workload metrics rather than decorative charts", () => {
      mockRole = UserRole.ROLE_HANDLER;
      const html = renderToStaticMarkup(React.createElement(HandlerDashboard));

      expect(html).toContain("Assigned to Me");
      expect(html).toContain("In Progress");
      expect(html).toContain("High / Urgent Priority");
      expect(html).toContain("Escalations");
    });
  });

  // ==========================================================================
  // 3. HOD DEPARTMENT GOVERNANCE DASHBOARD
  // ==========================================================================
  describe("3. HOD Dashboard (ROLE_DEPT_HEAD)", () => {
    it("renders department triage queue and oversight metrics", () => {
      mockRole = UserRole.ROLE_DEPT_HEAD;
      mockDeptId = "00000000-0000-0000-0000-000000000010";
      const html = renderToStaticMarkup(React.createElement(HodDashboard));

      expect(html).toContain("Department Head Governance");
      expect(html).toContain("Department Authority");
      expect(html).toContain("Unassigned Triage");
      expect(html).toContain("Escalated (Tier 2)");
      expect(html).toContain("Department Triage &amp; Assignment Queue");
    });

    it("renders honest analytics unavailable state without fake percentages", () => {
      mockRole = UserRole.ROLE_DEPT_HEAD;
      const html = renderToStaticMarkup(React.createElement(HodDashboard));

      expect(html).toContain("Department Resolution Performance &amp; SLA Metrics");
      expect(html).toContain("Analytics Service Pending Phase 08 Aggregation Endpoint");
      expect(html).not.toContain("87% SLA Met");
      expect(html).not.toContain("99% Satisfaction");
    });
  });

  // ==========================================================================
  // 4. MANAGEMENT EXECUTIVE DASHBOARD
  // ==========================================================================
  describe("4. Management Dashboard (ROLE_MANAGEMENT)", () => {
    it("renders campus-wide executive overview and attention queue", () => {
      mockRole = UserRole.ROLE_MANAGEMENT;
      const html = renderToStaticMarkup(React.createElement(ManagementDashboard));

      expect(html).toContain("Institutional Management &amp; Executive Governance");
      expect(html).toContain("Campus-Wide Purview");
      expect(html).toContain("Campus Total");
      expect(html).toContain("Critical / Escalated");
      expect(html).toContain("Executive Attention Queue");
    });

    it("renders honest cluster analytics state without fake graphs and honest audit metric state", () => {
      mockRole = UserRole.ROLE_MANAGEMENT;
      const html = renderToStaticMarkup(React.createElement(ManagementDashboard));

      expect(html).toContain("Cluster Analytics Service Pending Backend Integration");
      expect(html).not.toContain("AI Predictive Analytics");
      expect(html).toContain("Audit metrics unavailable");
      expect(html).not.toContain(">100%<");
    });
  });

  // ==========================================================================
  // 5. SYSTEM ADMINISTRATOR DASHBOARD
  // ==========================================================================
  describe("5. Admin Dashboard (ROLE_ADMIN)", () => {
    it("renders system administration banner and infrastructure card", () => {
      mockRole = UserRole.ROLE_ADMIN;
      const html = renderToStaticMarkup(React.createElement(AdminDashboard));

      expect(html).toContain("System Administration &amp; Operations");
      expect(html).toContain("Technical Admin");
      expect(html).toContain("Application Liveness &amp; Infrastructure Health");
    });

    it("renders role & security boundary directory without arbitrary mutation powers", () => {
      mockRole = UserRole.ROLE_ADMIN;
      const html = renderToStaticMarkup(React.createElement(AdminDashboard));

      expect(html).toContain("Role &amp; Security Boundary Directory");
      expect(html).toContain("ROLE_STUDENT");
      expect(html).toContain("ROLE_HANDLER");
      expect(html).toContain("ROLE_DEPT_HEAD");
      expect(html).toContain("ROLE_MANAGEMENT");
      expect(html).toContain("ROLE_ADMIN");
    });
  });
});
