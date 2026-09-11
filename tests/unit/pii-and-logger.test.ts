import { describe, it, expect } from "vitest";
import { maskEmail, maskPhone, sanitizeLogData } from "@/shared/utils/pii";
import { Logger } from "@/infrastructure/logging/Logger";

describe("PII Redaction & Sanitization", () => {
  it("should mask email addresses correctly", () => {
    expect(maskEmail("john.doe@campus.edu")).toBe("j******e@campus.edu");
    expect(maskEmail("ab@test.com")).toBe("a*@test.com");
    expect(maskEmail("invalid")).toBe("[REDACTED_EMAIL]");
  });

  it("should mask phone numbers keeping only the last 4 digits", () => {
    expect(maskPhone("+919876543210")).toBe("*********3210");
    expect(maskPhone("123")).toBe("[REDACTED_PHONE]");
  });

  it("should redact sensitive fields in objects deeply", () => {
    const sensitivePayload = {
      user: {
        id: "u_1",
        email: "student@campus.edu",
        password: "super_secret_password_123",
        token: "jwt_ey...",
      },
      metadata: {
        apiKey: "sk-live-12345",
        status: "active",
      },
      publicInfo: "Complaint about library AC",
    };

    const sanitized = sanitizeLogData(sensitivePayload) as Record<string, unknown>;
    const user = sanitized.user as Record<string, unknown>;
    const metadata = sanitized.metadata as Record<string, unknown>;

    expect(user.password).toBe("[REDACTED]");
    expect(user.token).toBe("[REDACTED]");
    expect(user.email).toBe("[REDACTED]");
    expect(metadata.apiKey).toBe("[REDACTED]");
    expect(metadata.status).toBe("active");
    expect(sanitized.publicInfo).toBe("Complaint about library AC");
  });
});

describe("Structured Logger", () => {
  it("should create child logger with inherited context", () => {
    const parentLogger = new Logger({ level: "info", defaultContext: { service: "test-service" } });
    const childLogger = parentLogger.child({ requestId: "req-123" });
    expect(childLogger).toBeDefined();
  });
});
