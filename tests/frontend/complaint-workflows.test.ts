import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Components under test
import ComplaintsPage from "@/app/complaints/page";
import NewComplaintPage from "@/app/complaints/new/page";

// Overlays
import { ConflictModal } from "@/presentation/components/overlays/ConflictModal";

// Domain
import { UserRole } from "@/domain/complaint";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/complaints",
}));

// Mock AuthContext
vi.mock("@/presentation/context/AuthContext", () => ({
  useAuth: () => ({
    authState: "AUTHENTICATED",
    user: { id: "user-123", email: "student@campusplus.internal" },
    actor: { userId: "user-123", role: UserRole.ROLE_STUDENT, departmentId: null },
    role: UserRole.ROLE_STUDENT,
    departmentId: null,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    refreshActor: vi.fn(),
  }),
}));

// Mock apiClient
vi.mock("@/presentation/services/apiClient", () => ({
  apiClient: {
    listComplaints: vi.fn().mockResolvedValue({ items: [] }),
    submitComplaint: vi.fn().mockResolvedValue({ complaintId: "c-123", trackingCode: "CP-2026-00099" }),
    presignUpload: vi.fn().mockResolvedValue({ uploadUrl: "https://storage.internal/test" }),
  },
}));

describe("Phase 08-C: Complaint Workflows, Submission & OCC Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // 1. COMPLAINT DIRECTORY & SEARCH LIST
  // ==========================================================================
  describe("1. Complaints Directory (/complaints)", () => {
    it("renders search input, status filter, priority filter, and category filter", () => {
      const html = renderToStaticMarkup(React.createElement(ComplaintsPage));

      expect(html).toContain("My Complaints Ledger");
      expect(html).toContain("Search by reference code or title");
      expect(html).toContain("Filter by Status");
      expect(html).toContain("Filter by Priority");
      expect(html).toContain("Filter by Category");
    });
  });

  // ==========================================================================
  // 2. GUIDED COMPLAINT INTAKE WIZARD
  // ==========================================================================
  describe("2. Complaint Submission Intake (/complaints/new)", () => {
    it("renders category selection, title, description, and location fields", () => {
      const html = renderToStaticMarkup(React.createElement(NewComplaintPage));

      expect(html).toContain("Register Formal Grievance");
      expect(html).toContain("Category &amp; Jurisdiction");
      expect(html).toContain("Grievance Details");
      expect(html).toContain("Impact &amp; Suggested Priority");
      expect(html).toContain("Evidence &amp; Attachments");
      expect(html).toContain("Submit Grievance");
    });

    it("displays character limits and helper guidance", () => {
      const html = renderToStaticMarkup(React.createElement(NewComplaintPage));

      expect(html).toContain("10–120 characters");
      expect(html).toContain("minimum 30 characters");
    });
  });

  // ==========================================================================
  // 3. OPTIMISTIC CONCURRENCY CONTROL (409 CONFLICT)
  // ==========================================================================
  describe("3. OCC 409 Conflict Handling", () => {
    it("ConflictModal renders version disparity and reload CTA", () => {
      const html = renderToStaticMarkup(
        React.createElement(ConflictModal, {
          isOpen: true,
          expectedVersion: 2,
          currentVersion: 3,
          onClose: vi.fn(),
          onReload: vi.fn(),
        })
      );

      expect(html).toContain("Record Modified by Another User (HTTP 409)");
      expect(html).toContain("Optimistic Concurrency Conflict");
      expect(html).toContain("v2");
      expect(html).toContain("v3");
      expect(html).toContain("Reload Latest Complaint");
    });
  });
});
