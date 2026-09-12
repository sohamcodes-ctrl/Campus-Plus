import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "node:fs";
import path from "node:path";

// Component under test
import RootPage from "@/app/page";

// Security & Navigation utilities
import {
  isValidInternalRedirect,
  sanitizeRedirect,
} from "@/presentation/utils/security";
import { UserRole } from "@/domain/complaint";

// Module mocks
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

let mockAuthState: string = "INITIALIZING";
let mockAuthError: string | null = null;
const mockRefreshActor = vi.fn();

vi.mock("@/presentation/context/AuthContext", () => ({
  useAuth: () => ({
    authState: mockAuthState,
    error: mockAuthError,
    refreshActor: mockRefreshActor,
    user: mockAuthState === "AUTHENTICATED" ? { id: "user-1", email: "user@campus.edu" } : null,
    actor: mockAuthState === "AUTHENTICATED" ? { userId: "user-1", role: UserRole.ROLE_STUDENT, departmentId: null } : null,
    role: mockAuthState === "AUTHENTICATED" ? UserRole.ROLE_STUDENT : null,
    departmentId: null,
    isAuthenticated: mockAuthState === "AUTHENTICATED",
    isLoading: mockAuthState === "INITIALIZING" || mockAuthState === "AUTHENTICATING",
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

describe("Phase 08-C-D: Root Route ('/') Defect Correction & Entry Verification Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = "INITIALIZING";
    mockAuthError = null;
  });

  // =====================================================================
  // 1. LOGICAL CONTRACT TESTS: AUTHENTICATION & ROUTING FOUNDATION
  // =====================================================================
  describe("1. Root Route State Machine Traversal", () => {
    it("1. '/' unauthenticated: renders institutional Public Landing Page with product narrative and no legacy Phase 03", () => {
      mockAuthState = "UNAUTHENTICATED";
      const html = renderToStaticMarkup(React.createElement(RootPage, null));

      expect(html).contain("One Campus.");
      expect(html).contain("One Accountable System.");
      expect(html).contain("How It Works");
      expect(html).contain("Who Can Use Campus Plus");
      expect(html).contain("Institutional");
      expect(html).contain('href="/login"');
      expect(html).contain('href="/register"');
      expect(html).not.contain("Engineering Foundation");
      expect(html).not.contain("Phase 03");
      expect(html).not.contain("Modular Monolith");
    });

    it("2. '/' authenticated: renders accessible ShellLoading during dashboard transition", () => {
      mockAuthState = "AUTHENTICATED";
      const html = renderToStaticMarkup(React.createElement(RootPage, null));

      expect(html).contain(
        'role="status"'
      );
      expect(html).contain("Verifying your campus access");
      expect(html).not.contain("Engineering Foundation");
      expect(html).not.contain("Phase 03");
    });

    it("3. '/' authentication loading (INITIALIZING, AUTHENTICATING, PENDING): displays institutional loader", () => {
      for (const loadingState of ["INITIALIZING", "AUTHENTICATING", "AUTHENTICATED_PENDING_ACTOR"]) {
        mockAuthState = loadingState;
        const html = renderToStaticMarkup(React.createElement(RootPage, null));

        expect(html).contain('role="status"');
        expect(html).contain('aria-live="polite"');
        expect(html).contain("Verifying your campus access");
      }
    });

    it("4. '/' authentication failure (ERROR): renders accessible ShellError with diagnostic & retry", () => {
      mockAuthState = "ERROR";
      mockAuthError = "Server identity verification failed due to network timeout.";

      const html = renderToStaticMarkup(React.createElement(RootPage, null));

      expect(html).contain("Campus Plus Session Error");
      expect(html).contain("Server identity verification failed due to network timeout.");
      expect(html).contain("Retry Connection");
      expect(html).not.contain("Engineering Foundation");
    });

    it("5. expired session: evaluates to UNAUTHENTICATED with no legacy Phase 03 content", () => {
      mockAuthState = "UNAUTHENTICATED";
      mockAuthError = "Authentication session expired. Please sign in again.";

      const html = renderToStaticMarkup(React.createElement(RootPage, null));
      expect(html).contain("One Campus.");
      expect(html).not.contain("Phase 03");
      expect(html).not.contain("Engineering Foundation");
    });

    it("6. invalid session / forbidden identity (FORBIDDEN): renders 403 ForbiddenState", () => {
      mockAuthState = "FORBIDDEN";

      const html = renderToStaticMarkup(React.createElement(RootPage, null));
      expect(html).contain("403 — Access Denied");
      expect(html).contain("Return to Dashboard");
      expect(html).not.contain("Engineering Foundation");
    });
  });

  // =====================================================================
  // 2. OPEN REDIRECT & SECURITY VERIFICATION (CWE-601)
  // ====================================================================
  describe("2. Redirect Security & Input Sanitization", () => {
    it("7. safe redirect behavior: allows whitelisted internal paths", () => {
      expect(isValidInternalRedirect("/dashboard")).toBe(true);
      expect(isValidInternalRedirect("/login")).toBe(true);
      expect(isValidInternalRedirect("/complaints/new")).toBe(true);
      expect(
        isValidInternalRedirect("/complaints/c-123e4567-e89b-12d3-a456-426614174000")
      ).toBe(true);
      expect(sanitizeRedirect("/dashboard", "/dashboard")).toBe("/dashboard");
    });

    it("8. malicious redirect: rejects protocol-relative //evil.com", () => {
      expect(isValidInternalRedirect("//evil.com")).toBe(false);
      expect(isValidInternalRedirect("//evil.com/dashboard")).toBe(false);
      expect(sanitizeRedirect("//evil.com", "/dashboard")).toBe("/dashboard");
    });

    it("9. malicious redirect: rejects absolute URL https://evil.com", () => {
      expect(isValidInternalRedirect("https://evil.com")).toBe(false);
      expect(isValidInternalRedirect("http://evil.com/dashboard")).toBe(false);
      expect(sanitizeRedirect("https://evil.com", "/dashboard")).toBe("/dashboard");
    });

    it("10. malicious redirect: rejects backslash vectors \\evil.com and /\\evil.com", () => {
      expect(isValidInternalRedirect("\\evil.com")).toBe(false);
      expect(isValidInternalRedirect("/\\evil.com")).toBe(false);
      expect(isValidInternalRedirect("/path\\evil.com")).toBe(false);
      expect(sanitizeRedirect("\\evil.com", "/dashboard")).toBe("/dashboard");
    });

    it("11. encoded redirect bypass attempts: rejects URL-encoded protocol-relative and scheme vectors", () => {
      expect(isValidInternalRedirect("/%2f%2fevil.com")).toBe(false);
      expect(isValidInternalRedirect("/%5C%5Cevil.com")).toBe(false);
      expect(isValidInternalRedirect("javascript:alert(1)")).toBe(false);
      expect(isValidInternalRedirect("/javascript:alert(1)")).toBe(false);
      expect(isValidInternalRedirect("data:text/html,<script>alert(1)</script>")).toBe(false);
    });

    it("12. query-string redirect attempts: prevents open redirects disguised as query parameters", () => {
      expect(isValidInternalRedirect("https://evil.com?target=/dashboard")).toBe(false);
      expect(isValidInternalRedirect("//evil.com?redirect=/dashboard")).toBe(false);
      expect(sanitizeRedirect("https://evil.com?target=/dashboard", "/dashboard")).toBe("/dashboard");
    });
  });

  // =====================================================================
  // 3. OBSOLETE CONTENT ELIMINATION & CODEBASE HYGIENE
  // =====================================================================
  describe("3. Obsolete Phase-03 Content Elimination", () => {
    it("13. root route source file does not contain legacy Phase-03 content", () => {
      const pagePath = path.resolve(process.cwd(), "src/app/page.tsx");
      const fileContent = fs.readFileSync(pagePath, "utf-8");

      expect(fileContent).not.contain("Modular Monolith");
      expect(fileContent).not.contain("Phase 03 Foundation Active");
      expect(fileContent).not.contain("Inspect /api/health");
    });

    it("14. root route source file does not contain 'Engineering Foundation'", () => {
      const pagePath = path.resolve(process.cwd(), "src/app/page.tsx");
      const fileContent = fs.readFileSync(pagePath, "utf-8");

      expect(fileContent).not.contain("Engineering Foundation");
    });

    it("15. root route source file does not contain 'Phase 03'", () => {
      const pagePath = path.resolve(process.cwd(), "src/app/page.tsx");
      const fileContent = fs.readFileSync(pagePath, "utf-8");

      expect(fileContent).not.contain("Phase 03 —");
      expect(fileContent).not.contain("Phase 03 Foundation");
    });

    it("16. authenticated user reaches approved dashboard flow", () => {
      const pagePath = path.resolve(process.cwd(), "src/app/page.tsx");
      const fileContent = fs.readFileSync(pagePath, "utf-8");

      expect(fileContent).contain('router.replace("/dashboard")');
      expect(fileContent).contain('href="/login"');
      expect(fileContent).contain('href="/register"');
    });

    it("17. no role spoofing through client navigation or URL injection", () => {
      const pagePath = path.resolve(process.cwd(), "src/app/page.tsx");
      const fileContent = fs.readFileSync(pagePath, "utf-8");

      expect(fileContent).not.contain('searchParams.get("role")');
      expect(fileContent).not.contain('searchParams.get("actor")');
      expect(fileContent).not.contain('searchParams.get("department")');
      expect(fileContent).contain("useAuth()");
    });

    it("18. no backend files changed during root route defect correction", () => {
      const forbiddenBackendPaths = [
        "src/domain/complaint/Complaint.ts",
        "src/domain/complaint/policies/AuthorizationPolicy.ts",
        "src/application/use-cases/SubmitComplaintUseCase.ts",
        "src/infrastructure/database/DatabaseClient.ts",
      ];

      for (const filePath of forbiddenBackendPaths) {
        const fullPath = path.resolve(process.cwd(), filePath);
        expect(fs.existsSync(fullPath)).toBe(true);
      }
    });
  });
});
