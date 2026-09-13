/**
 * Security & Input Validation Utilities for Campus Plus Frontend
 * Enforces open-redirect prevention (CWE-601) and strict route parameter validation.
 */

const ALLOWED_INTERNAL_PREFIXES = [
  "/dashboard",
  "/complaints",
  "/login",
  "/register",
];

/**
 * Validates whether a redirect URL is a safe internal relative path.
 * Strictly prevents open redirects (e.g. //attacker.com, javascript:, https://)
 */
export function isValidInternalRedirect(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim();

  // Must begin with a single slash
  if (!trimmed.startsWith("/")) return false;

  // Must not begin with double slashes (protocol-relative URLs like //evil.com)
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return false;

  // Must not contain backslashes (Windows path manipulation or browser bypasses)
  if (trimmed.includes("\\")) return false;

  // Must not contain colon before the first query or slash (e.g. /javascript:alert(1))
  const pathBeforeQuery = trimmed.split("?")[0];
  if (pathBeforeQuery.includes(":")) return false;

  // Must match allowed internal route prefixes
  const isAllowed = ALLOWED_INTERNAL_PREFIXES.some(
    (prefix) => pathBeforeQuery === prefix || pathBeforeQuery.startsWith(`${prefix}/`)
  );

  return isAllowed;
}

/**
 * Returns the sanitized internal redirect URL, or the fallback path if invalid.
 */
export function sanitizeRedirect(url: string | null | undefined, fallback: string = "/dashboard"): string {
  if (isValidInternalRedirect(url)) {
    return url!.trim();
  }
  return fallback;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TRACKING_CODE_REGEX = /^CP-\d{4}-\d{5}$/;

export type RouteIdType = "uuid" | "trackingCode" | "invalid";

/**
 * Validates whether a route parameter conforms to expected UUID or Tracking Code pattern.
 * Prevents injection attacks and unnecessary API calls for malformed inputs.
 */
export function validateRouteId(id: string | null | undefined): {
  isValid: boolean;
  type: RouteIdType;
} {
  if (!id || typeof id !== "string") {
    return { isValid: false, type: "invalid" };
  }

  const trimmed = id.trim();

  if (UUID_REGEX.test(trimmed)) {
    return { isValid: true, type: "uuid" };
  }

  if (TRACKING_CODE_REGEX.test(trimmed)) {
    return { isValid: true, type: "trackingCode" };
  }

  return { isValid: false, type: "invalid" };
}
