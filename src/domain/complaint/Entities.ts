import { Entity } from "@/domain/common/Entity";
import { EscalationTierType } from "./ComplaintTypes";

export interface ComplaintAssignmentProps {
  readonly handlerId: string;
  readonly assignedById: string;
  readonly assignedAt: string;
  unassignedAt?: string;
  isCurrent: boolean;
  reason?: string;
}

export class ComplaintAssignment extends Entity<ComplaintAssignmentProps> {
  constructor(props: ComplaintAssignmentProps, id: string) {
    super(props, id, props.assignedAt);
  }

  get handlerId(): string {
    return this._props.handlerId;
  }

  get assignedById(): string {
    return this._props.assignedById;
  }

  get assignedAt(): string {
    return this._props.assignedAt;
  }

  get unassignedAt(): string | undefined {
    return this._props.unassignedAt;
  }

  get isCurrent(): boolean {
    return this._props.isCurrent;
  }

  get reason(): string | undefined {
    return this._props.reason;
  }

  public endAssignment(unassignedAt: string): void {
    this._props.isCurrent = false;
    this._props.unassignedAt = unassignedAt;
  }
}

export interface ComplaintForwardProps {
  readonly fromDepartmentId: string;
  readonly toDepartmentId: string;
  readonly forwardedById: string;
  readonly forwardSequence: number;
  readonly rationale: string;
  readonly forwardedAt: string;
}

export class ComplaintForward extends Entity<ComplaintForwardProps> {
  constructor(props: ComplaintForwardProps, id: string) {
    super(props, id, props.forwardedAt);
  }

  get fromDepartmentId(): string {
    return this._props.fromDepartmentId;
  }

  get toDepartmentId(): string {
    return this._props.toDepartmentId;
  }

  get forwardedById(): string {
    return this._props.forwardedById;
  }

  get forwardSequence(): number {
    return this._props.forwardSequence;
  }

  get rationale(): string {
    return this._props.rationale;
  }

  get forwardedAt(): string {
    return this._props.forwardedAt;
  }
}

export interface ComplaintEscalationProps {
  readonly fromTier: EscalationTierType;
  readonly toTier: EscalationTierType;
  readonly escalatedById?: string;
  readonly isAutomated: boolean;
  readonly reason: string;
  readonly escalatedAt: string;
}

export class ComplaintEscalation extends Entity<ComplaintEscalationProps> {
  constructor(props: ComplaintEscalationProps, id: string) {
    super(props, id, props.escalatedAt);
  }

  get fromTier(): EscalationTierType {
    return this._props.fromTier;
  }

  get toTier(): EscalationTierType {
    return this._props.toTier;
  }

  get escalatedById(): string | undefined {
    return this._props.escalatedById;
  }

  get isAutomated(): boolean {
    return this._props.isAutomated;
  }

  get reason(): string {
    return this._props.reason;
  }

  get escalatedAt(): string {
    return this._props.escalatedAt;
  }
}

export interface ResolutionProps {
  readonly resolvedById: string;
  readonly summary: string;
  readonly resolvedAt: string;
  studentVerified?: boolean;
  disputeReason?: string;
  disputedAt?: string;
}

export class Resolution extends Entity<ResolutionProps> {
  constructor(props: ResolutionProps, id: string) {
    super(props, id, props.resolvedAt);
  }

  get resolvedById(): string {
    return this._props.resolvedById;
  }

  get summary(): string {
    return this._props.summary;
  }

  get resolvedAt(): string {
    return this._props.resolvedAt;
  }

  get studentVerified(): boolean | undefined {
    return this._props.studentVerified;
  }

  get disputeReason(): string | undefined {
    return this._props.disputeReason;
  }

  get disputedAt(): string | undefined {
    return this._props.disputedAt;
  }

  public verify(): void {
    this._props.studentVerified = true;
  }

  public dispute(reason: string, disputedAt: string): void {
    this._props.studentVerified = false;
    this._props.disputeReason = reason;
    this._props.disputedAt = disputedAt;
  }
}
