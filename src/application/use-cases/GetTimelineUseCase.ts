import { UseCase } from "../common/UseCase";
import {
  IComplaintQueryRepository,
  TimelineItemView,
} from "../ports/IComplaintQueryRepository";
import { IComplaintRepository } from "../ports/IComplaintRepository";
import {
  ComplaintId,
  TrackingCode,
  ActorContext,
  UserRole,
  AuthorizationPolicy,
  DomainOperation,
} from "@/domain/complaint";
import { Result, ok, err } from "@/domain/common/Result";
import { AppError } from "@/shared/errors/AppError";
import { ComplaintNotFoundError } from "@/domain/complaint/DomainErrors";

export interface GetTimelineQuery {
  idOrTrackingCode: string;
  actor: ActorContext;
}

/**
 * Get Complaint Timeline Query Use Case (INV-012).
 * Enforces visibility boundaries:
 * - Complainants receive public lifecycle events with staff-internal remarks stripped.
 * - Authorized staff and administrators receive full operational event history.
 */
export class GetTimelineUseCase implements UseCase<GetTimelineQuery, Result<TimelineItemView[], AppError>> {
  constructor(
    private readonly complaintRepo: IComplaintRepository,
    private readonly queryRepo: IComplaintQueryRepository
  ) {}

  public async execute(query: GetTimelineQuery): Promise<Result<TimelineItemView[], AppError>> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      query.idOrTrackingCode
    );

    const complaint = isUuid
      ? await this.complaintRepo.findById(new ComplaintId(query.idOrTrackingCode))
      : await this.complaintRepo.findByTrackingCode(new TrackingCode(query.idOrTrackingCode));

    if (!complaint) {
      return err(new ComplaintNotFoundError(query.idOrTrackingCode));
    }

    // Verify actor is authorized to VIEW this complaint
    const authCheck = AuthorizationPolicy.canExecute(
      query.actor,
      DomainOperation.VIEW,
      complaint.toResourceContext()
    );

    if (authCheck.isFailure) {
      return err(authCheck.error as AppError);
    }

    const isStaff =
      query.actor.role !== UserRole.ROLE_STUDENT && query.actor.role !== UserRole.ROLE_FACULTY;

    const timeline = await this.queryRepo.getTimeline(complaint.id.toString(), isStaff);
    return ok(timeline);
  }
}
