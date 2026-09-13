/**
 * Campus Plus — Presentation Formatters & Sanitizers
 *
 * Guarantees:
 * 1. Zero raw UUID leakage to end-users (DEFECT F).
 * 2. Zero "Invalid Date" outputs to end-users (DEFECT G).
 * 3. Human-readable institutional fallbacks.
 */

export const MASTER_DEPARTMENTS: Record<string, { code: string; name: string }> = {
  "00000000-0000-0000-0000-000000000010": {
    code: "DEPT-IT",
    name: "Information Technology",
  },
  "00000000-0000-0000-0000-000000000020": {
    code: "DEPT-HOSTEL",
    name: "Hostel Administration",
  },
  "00000000-0000-0000-0000-000000000030": {
    code: "DEPT-MAINT",
    name: "Campus Maintenance",
  },
  "00000000-0000-0000-0000-000000000040": {
    code: "DEPT-ACAD",
    name: "Academic Affairs",
  },
  "00000000-0000-0000-0000-000000000050": {
    code: "DEPT-SANIT",
    name: "Sanitation & Hygiene",
  },
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Maps a department ID or UUID to its official human-readable name.
 * Prevents raw UUIDs from ever displaying in ordinary user-facing interfaces.
 */
export function formatDepartmentName(
  departmentId?: string | null,
  fallback = "Department Scope Active"
): string {
  if (!departmentId) return fallback;

  const trimmed = departmentId.trim();
  if (MASTER_DEPARTMENTS[trimmed]) {
    return MASTER_DEPARTMENTS[trimmed].name;
  }

  // If already a human name (non-UUID), return directly
  if (!UUID_REGEX.test(trimmed)) {
    return trimmed;
  }

  // If unrecognized UUID, never display raw UUID to user
  return fallback;
}

/**
 * Robust date formatter. Guarantees that "Invalid Date" is never rendered.
 */
export function formatDate(
  dateVal?: string | number | Date | null,
  fallback = "Date unavailable"
): string {
  if (!dateVal) return fallback;

  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;

    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return fallback;
  }
}

/**
 * Robust date and time formatter.
 */
export function formatDateTime(
  dateVal?: string | number | Date | null,
  fallback = "Date unavailable"
): string {
  if (!dateVal) return fallback;

  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;

    const datePart = d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${datePart} at ${timePart}`;
  } catch {
    return fallback;
  }
}

/**
 * Robust time formatter.
 */
export function formatTime(
  dateVal?: string | number | Date | null,
  fallback = "Time unavailable"
): string {
  if (!dateVal) return fallback;

  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;

    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return fallback;
  }
}

export const CATEGORY_LABELS: Record<string, string> = {
  NETWORK_WIFI: "Network & Campus Wi-Fi",
  HOSTEL_MAINTENANCE: "Hostel Maintenance & Facilities",
  CLASSROOM_INFRASTRUCTURE: "Classroom & Lab Infrastructure",
  ACADEMIC_EVALUATION: "Academic & Evaluation Concerns",
  CAMPUS_SANITATION: "Campus Sanitation & Grounds",
  OTHER: "Other General Inquiries",
};

export function formatCategoryLabel(categoryId?: string | null): string {
  if (!categoryId) return "General Inquiries";
  return CATEGORY_LABELS[categoryId] || categoryId;
}
