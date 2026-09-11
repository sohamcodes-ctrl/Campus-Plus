/**
 * Utility functions for ID generation and correlation tracking.
 */

/**
 * Generate a unique correlation ID for request tracing.
 */
export function generateCorrelationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback if crypto.randomUUID is not available in unusual environments
  return "corr-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 9);
}

/**
 * Generate a sequential/formatted reference number for complaints (placeholder format: CP-YYYY-XXXX).
 */
export function generateComplaintReference(seq: number, year = new Date().getFullYear()): string {
  const padded = seq.toString().padStart(5, "0");
  return `CP-${year}-${padded}`;
}
