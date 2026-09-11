/**
 * Canonical Complaint Lifecycle Statuses & Transition Matrix
 * Strictly aligned with Phase 01 COMPLAINT-LIFECYCLE.md & Phase 04 PostgreSQL complaint_status_enum.
 */

export const ComplaintStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  REVIEWED: "REVIEWED",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  FORWARDED: "FORWARDED",
  ESCALATED: "ESCALATED",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
  REOPENED: "REOPENED",
  REJECTED: "REJECTED",
  DUPLICATE: "DUPLICATE",
  CANCELLED: "CANCELLED",
} as const;

export type ComplaintStatusType = (typeof ComplaintStatus)[keyof typeof ComplaintStatus];

/**
 * Authoritative Deterministic Transition Matrix
 * Maps each current state to its set of legally permitted destination states.
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<ComplaintStatusType, readonly ComplaintStatusType[]> = {
  [ComplaintStatus.DRAFT]: [
    ComplaintStatus.SUBMITTED,
  ],
  [ComplaintStatus.SUBMITTED]: [
    ComplaintStatus.REVIEWED,
    ComplaintStatus.ASSIGNED,
    ComplaintStatus.REJECTED,
    ComplaintStatus.CANCELLED,
  ],
  [ComplaintStatus.REVIEWED]: [
    ComplaintStatus.ASSIGNED,
    ComplaintStatus.FORWARDED,
    ComplaintStatus.ESCALATED,
    ComplaintStatus.REJECTED,
    ComplaintStatus.DUPLICATE,
  ],
  [ComplaintStatus.ASSIGNED]: [
    ComplaintStatus.IN_PROGRESS,
    ComplaintStatus.FORWARDED,
    ComplaintStatus.ESCALATED,
    ComplaintStatus.ASSIGNED, // Reassignment within the owning department
  ],
  [ComplaintStatus.IN_PROGRESS]: [
    ComplaintStatus.RESOLVED,
    ComplaintStatus.FORWARDED,
    ComplaintStatus.ESCALATED,
  ],
  [ComplaintStatus.FORWARDED]: [
    ComplaintStatus.REVIEWED,
    ComplaintStatus.ASSIGNED,
    ComplaintStatus.ESCALATED,
  ],
  [ComplaintStatus.ESCALATED]: [
    ComplaintStatus.ASSIGNED,
    ComplaintStatus.IN_PROGRESS,
    ComplaintStatus.RESOLVED,
    ComplaintStatus.FORWARDED,
  ],
  [ComplaintStatus.RESOLVED]: [
    ComplaintStatus.CLOSED,
    ComplaintStatus.REOPENED,
  ],
  [ComplaintStatus.REOPENED]: [
    ComplaintStatus.ASSIGNED,
    ComplaintStatus.IN_PROGRESS,
    ComplaintStatus.ESCALATED,
  ],
  [ComplaintStatus.REJECTED]: [
    ComplaintStatus.CLOSED,
  ],
  [ComplaintStatus.DUPLICATE]: [
    ComplaintStatus.CLOSED,
  ],
  [ComplaintStatus.CANCELLED]: [
    ComplaintStatus.CLOSED,
  ],
  [ComplaintStatus.CLOSED]: [], // Strictly terminal invariant (INV-003)
};

/**
 * Validates whether a state transition is permitted by domain invariants.
 */
export function canTransition(from: ComplaintStatusType, to: ComplaintStatusType): boolean {
  const allowed = ALLOWED_STATUS_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/**
 * Checks if a given status represents a terminal state.
 */
export function isTerminalStatus(status: ComplaintStatusType): boolean {
  return status === ComplaintStatus.CLOSED;
}
