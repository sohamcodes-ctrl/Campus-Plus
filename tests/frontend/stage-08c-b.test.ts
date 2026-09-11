import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ApiClient, ApiClientError } from "@/presentation/services/apiClient";
import { UserRole } from "@/domain/complaint";
import { ROLE_THEMES, applyRoleTheme } from "@/presentation/context/AuthContext";
import fs from "node:fs";
import path from "node:path";

describe("Stage 08-C-B: Frontend Architecture, Tokens & API Client Suite", () => {
  let client: ApiClient;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    client = new ApiClient({ baseUrl: "https://test.campusplus.internal" });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // 1. DESIGN TOKEN & THEME RECONCILIATION VERIFICATION
  // ==========================================================================
  describe("Design Tokens & Role Themes", () => {
    it("globals.css contains Tailwind v4 @theme block with all 5 role palettes and 13 status tokens", () => {
      const cssPath = path.resolve(__dirname, "../../src/app/globals.css");
      const css = fs.readFileSync(cssPath, "utf-8");

      expect(css).toContain("@theme");
      // All 5 persona colors
      expect(css).toContain("--color-student-primary: #7FA8D9;");
      expect(css).toContain("--color-student-btn-text: #1E3A5F;");
      expect(css).toContain("--color-handler-primary: #7FC4B2;");
      expect(css).toContain("--color-handler-btn-text: #1A3830;");
      expect(css).toContain("--color-hod-primary: #B39DDB;");
      expect(css).toContain("--color-hod-btn-text: #2B1E40;");
      expect(css).toContain("--color-admin-primary: #9FB4C7;");
      expect(css).toContain("--color-management-primary: #E3A6AE;");

      // 13 FSM Status Tokens
      expect(css).toContain("--color-status-draft-bg");
      expect(css).toContain("--color-status-submitted-bg");
      expect(css).toContain("--color-status-reviewed-bg");
      expect(css).toContain("--color-status-assigned-bg");
      expect(css).toContain("--color-status-inprogress-bg");
      expect(css).toContain("--color-status-forwarded-bg");
      expect(css).toContain("--color-status-escalated-bg");
      expect(css).toContain("--color-status-resolved-bg");
      expect(css).toContain("--color-status-closed-bg");
      expect(css).toContain("--color-status-reopened-bg");
      expect(css).toContain("--color-status-rejected-bg");
      expect(css).toContain("--color-status-duplicate-bg");
      expect(css).toContain("--color-status-cancelled-bg");
    });

    it("ROLE_THEMES provides WCAG AA compliant dark text tokens for all pastel buttons", () => {
      expect(ROLE_THEMES[UserRole.ROLE_STUDENT].btnText).toBe("#1E3A5F");
      expect(ROLE_THEMES[UserRole.ROLE_HANDLER].btnText).toBe("#1A3830");
      expect(ROLE_THEMES[UserRole.ROLE_DEPT_HEAD].btnText).toBe("#2B1E40");
      expect(ROLE_THEMES[UserRole.ROLE_ADMIN].btnText).toBe("#1C2B38");
      expect(ROLE_THEMES[UserRole.ROLE_MANAGEMENT].btnText).toBe("#3D1C22");
    });

    it("applyRoleTheme injects css variables safely when document is defined", () => {
      const setPropertySpy = vi.fn();
      const originalDoc = globalThis.document;
      globalThis.document = {
        documentElement: {
          style: {
            setProperty: setPropertySpy,
          } as unknown as CSSStyleDeclaration,
        },
      } as unknown as Document;

      applyRoleTheme(UserRole.ROLE_HANDLER);
      expect(setPropertySpy).toHaveBeenCalledWith("--role-primary", "#7FC4B2");
      expect(setPropertySpy).toHaveBeenCalledWith("--role-btn-text", "#1A3830");

      globalThis.document = originalDoc;
    });
  });

  // ==========================================================================
  // 2. API CLIENT OPERATION CONTRACTS & HEADERS
  // ==========================================================================
  describe("API Client Header & Authorization Governance", () => {
    it("attaches Authorization Bearer token when TokenProvider is configured", async () => {
      client.setTokenProvider(async () => "test-jwt-token-123");

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          success: true,
          data: { userId: "user-1", role: UserRole.ROLE_STUDENT, departmentId: null },
        }),
      });
      globalThis.fetch = mockFetch;

      await client.getAuthMe();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callInit = mockFetch.mock.calls[0][1] as RequestInit;
      const headers = callInit.headers as Record<string, string>;
      expect(headers["Authorization"]).toBe("Bearer test-jwt-token-123");
      expect(headers["x-correlation-id"]).toBeDefined();
    });

    it("attaches Idempotency-Key header ONLY on submitComplaint", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        headers: new Headers(),
        json: async () => ({
          success: true,
          data: { complaintId: "c-1", trackingCode: "CP-2026-00001", status: "SUBMITTED" },
        }),
      });
      globalThis.fetch = mockFetch;

      const fixedKey = "idem-key-uuid-999";
      await client.submitComplaint(
        {
          title: "WiFi connectivity broken in hostel 4",
          description: "All access points on floor 2 return authentication timeouts.",
          categoryId: "9a7522f2-8c9e-4c7b-b892-0b8ecaa12001",
          departmentId: "3e589e44-d85c-4e89-a292-127b14d59001",
          locationDetails: "Hostel 4, 2nd Floor Corridor",
        },
        fixedKey
      );

      const callInit = mockFetch.mock.calls[0][1] as RequestInit;
      const headers = callInit.headers as Record<string, string>;
      expect(headers["Idempotency-Key"]).toBe(fixedKey);
    });

    it("does NOT attach Idempotency-Key on lifecycle mutations but passes expectedVersion in body", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          success: true,
          data: { message: "Complaint resolved successfully" },
        }),
      });
      globalThis.fetch = mockFetch;

      await client.resolveComplaint("complaint-uuid-1", {
        resolutionSummary: "Replaced faulty wireless access point unit.",
        expectedVersion: 3,
      });

      const callInit = mockFetch.mock.calls[0][1] as RequestInit;
      const headers = callInit.headers as Record<string, string>;
      expect(headers["Idempotency-Key"]).toBeUndefined();
      const body = JSON.parse(callInit.body as string);
      expect(body.expectedVersion).toBe(3);
      expect(body.resolutionSummary).toBe("Replaced faulty wireless access point unit.");
    });
  });

  // ==========================================================================
  // 3. ERROR NORMALIZATION & OCC 409 CONFLICT HANDLING
  // ==========================================================================
  describe("API Client Error Normalization", () => {
    it("normalizes HTTP 409 Conflict into ApiClientError with isConflict = true", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        headers: new Headers({ "x-correlation-id": "corr-409" }),
        json: async () => ({
          success: false,
          error: {
            code: "CONCURRENCY_CONFLICT",
            message: "The complaint was updated by another process. Expected version 2 but found 3.",
            correlation_id: "corr-409",
          },
        }),
      });

      await expect(
        client.assignComplaint("comp-1", {
          handlerId: "handler-uuid",
          expectedVersion: 2,
        })
      ).rejects.toThrowError(ApiClientError);

      try {
        await client.assignComplaint("comp-1", {
          handlerId: "handler-uuid",
          expectedVersion: 2,
        });
      } catch (err: unknown) {
        const clientErr = err as ApiClientError;
        expect(clientErr.statusCode).toBe(409);
        expect(clientErr.code).toBe("CONCURRENCY_CONFLICT");
        expect(clientErr.isConflict).toBe(true);
        expect(clientErr.correlationId).toBe("corr-409");
      }
    });

    it("normalizes HTTP 401 Unauthorized into ApiClientError with isUnauthorized = true", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers(),
        json: async () => ({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication token is missing or expired.",
          },
        }),
      });

      try {
        await client.getAuthMe();
      } catch (err: unknown) {
        const clientErr = err as ApiClientError;
        expect(clientErr.statusCode).toBe(401);
        expect(clientErr.isUnauthorized).toBe(true);
      }
    });

    it("normalizes HTTP 403 Forbidden into ApiClientError with isForbidden = true", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        headers: new Headers(),
        json: async () => ({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Access Denied: You do not have permission to view this complaint.",
          },
        }),
      });

      try {
        await client.getComplaint("forbidden-id");
      } catch (err: unknown) {
        const clientErr = err as ApiClientError;
        expect(clientErr.statusCode).toBe(403);
        expect(clientErr.isForbidden).toBe(true);
      }
    });

    it("normalizes network failures into ApiClientError with code NETWORK_ERROR", async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Failed to fetch"));

      try {
        await client.getHealth();
      } catch (err: unknown) {
        const clientErr = err as ApiClientError;
        expect(clientErr.statusCode).toBe(0);
        expect(clientErr.code).toBe("NETWORK_ERROR");
        expect(clientErr.message).toContain("Network connection failed");
      }
    });
  });

  // ==========================================================================
  // 4. STORAGE PRESIGN ATTACHMENT CONTRACT
  // ==========================================================================
  describe("Presign Attachment Storage", () => {
    it("issues presigned upload URL with MIME type and size enforcement", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          success: true,
          data: {
            uploadUrl: "https://supabase.co/storage/v1/s3/upload/123",
            fileKey: "complaints/temp/photo.png",
            publicUrl: "https://supabase.co/storage/v1/object/public/campus-plus-attachments/complaints/temp/photo.png",
          },
        }),
      });

      const res = await client.presignUpload({
        filename: "photo.png",
        mimeType: "image/png",
        fileSizeBytes: 2048000,
      });

      expect(res.uploadUrl).toContain("supabase.co");
      expect(res.fileKey).toBe("complaints/temp/photo.png");
    });
  });
});
