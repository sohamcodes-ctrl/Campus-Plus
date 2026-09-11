/**
 * PII (Personally Identifiable Information) Redaction & Sanitization Utilities
 * Implements security requirements from ADR-009 & ADR-011.
 */

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "session",
  "jwt",
  "apikey",
  "api_key",
  "access_token",
  "refresh_token",
  "service_role_key",
  "phone",
  "mobile",
  "email",
  "aadhaar",
  "ssn",
  "student_id",
  "registration_number",
]);

/**
 * Mask an email address: j***e@example.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "[REDACTED_EMAIL]";
  const [local, domain] = email.split("@");
  if (!local || !domain) return "[REDACTED_EMAIL]";
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

/**
 * Mask a phone number, preserving only the last 4 digits
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return "[REDACTED_PHONE]";
  const visible = phone.slice(-4);
  return `${"*".repeat(Math.max(0, phone.length - 4))}${visible}`;
}

/**
 * Deeply sanitize an object or data structure by masking known sensitive keys
 */
export function sanitizeLogData<T>(data: T, depth = 0): unknown {
  if (depth > 6) return "[MAX_DEPTH_EXCEEDED]";
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    return data;
  }

  if (typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes("password") || lowerKey.includes("secret") || lowerKey.includes("token")) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeLogData(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
