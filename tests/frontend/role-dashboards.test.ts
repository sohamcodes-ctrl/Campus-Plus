import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Components under test
import { StudentDashboard } from "@/presentation/components/dashboard/StudentDashboard";
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
  // 1. STUDENT / COMPLAINANT DASHBOARD
  // ==========================================================================
  describe("1. Student Dashboard (ROLE_STUDENT)", () => {
    it("renders prominent 'Submit New Grievance' primary action CTA", () => {
      mockRole = UserRole.ROLE_STUDENT;
      const html = renderToStaticMarkup(React.createElement(StudentDashboard));

      expect(html).toContain("Submit New Grievance");
      expect(html).toContain("Welcome, Student Portal");
      expect(html).toContain("Active Complainant");
    });

    it("renders real metrics cards for Total, In-Progress, Verification, Closed", () => {
      mockRole = UserRole.ROLE_STUDENT;
      const html = renderToStaticMarkup(React.createElement(StudentDashboard));

      expect(html).toContain("Total Filed");
      expect(html).toContain("Active In-Progress");
      expect(html).toContain("Awaiting Verification");
      expect(html).toContain("Closed");
    });

    it("renders 'My Active Complaints' table header with tracking code column", () => {
      mockRole = UserRole.ROLE_STUDENT;
      const html = renderToStaticMarkup(React.createElement(StudentDashboard));

      expect(html).toContain("My Active Complaints");
      expect(html).toContain("Tracking Code");
      expect(html).toContain("Subject");
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

    it("renders honest cluster analytics state without fake graphs", () => {
      mockRole = UserRole.ROLE_MANAGEMENT;
      const html = renderToStaticMarkup(React.createElement(ManagementDashboard));

      expect(html).toContain("Cluster Analytics Service Pending Backend Integration");
      expect(html).not.toContain("AI Predictive Analytics");
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
