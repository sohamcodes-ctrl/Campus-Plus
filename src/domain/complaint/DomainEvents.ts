import { DomainEvent } from "@/domain/common/DomainEvent";

export interface ComplaintSubmittedPayload {
  readonly complaintId: string;
  readonly trackingCode: string;
  readonly complainantId: string;
  readonly departmentId: string;
  readonly categoryId: string;
  readonly priority: string;
  readonly title: string;
}

export interface ComplaintAssignedPayload {
  readonly complaintId: string;
  readonly handlerId: string;
  readonly assignedById: string;
  readonly departmentId: string;
}

export interface ComplaintForwardedPayload {
  readonly complaintId: string;
  readonly fromDepartmentId: string;
  readonly toDepartmentId: string;
  readonly forwardedById: string;
  readonly forwardSequence: number;
  readonly rationale: string;
}

export interface ComplaintEscalatedPayload {
  readonly complaintId: string;
  readonly fromTier: string;
  readonly toTier: string;
  readonly isAutomated: boolean;
  readonly escalatedById?: string;
  readonly reason: string;
}

export interface ComplaintResolvedPayload {
  readonly complaintId: string;
  readonly resolvedById: string;
  readonly summary: string;
  readonly resolvedAt: string;
}

export interface ComplaintClosedPayload {
  readonly complaintId: string;
  readonly closedAt: string;
  readonly reason: string;
  readonly verifiedByComplainant: boolean;
}

export interface ComplaintReopenedPayload {
  readonly complaintId: string;
  readonly complainantId: string;
  readonly disputeReason: string;
  readonly reopenedAt: string;
}

export interface ComplaintGenericEventPayload {
  readonly complaintId: string;
  readonly actorId: string;
  readonly previousStatus: string;
  readonly newStatus: string;
  readonly remarks?: string;
}

export function createComplaintDomainEvent<T>(
  aggregateId: string,
  eventType: string,
  payload: T
): DomainEvent<T> {
  return {
    eventId: crypto.randomUUID(),
    aggregateId,
    eventType,
    occurredAt: new Date().toISOString(),
    payload,
  };
}
