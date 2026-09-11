import { UseCase } from "../common/UseCase";
import { IComplaintRepository } from "../ports/IComplaintRepository";
import {
  Complaint,
  ComplaintId,
  TrackingCode,
  ActorContext,
  AuthorizationPolicy,
  DomainOperation,
} from "@/domain/complaint";
import { Result, ok, err } from "@/domain/common/Result";
import { AppError } from "@/shared/errors/AppError";
import { ComplaintNotFoundError } from "@/domain/complaint/DomainErrors";

export interface GetComplaintQuery {
  idOrTrackingCode: string;
  actor: ActorContext;
}

/**
 * Get Complaint Query Use Case.
 * Retrieves complaint by UUID or Tracking Code, enforces multi-dimensional VIEW authorization (BOLA/IDOR),
 * and returns the aggregate for presentation DTO projection.
 */
export class GetComplaintUseCase implements UseCase<GetComplaintQuery, Result<Complaint, AppError>> {
  constructor(private readonly complaintRepo: IComplaintRepository) {}

  public async execute(query: GetComplaintQuery): Promise<Result<Complaint, AppError>> {
    let complaint: Complaint | null = null;

    // Check if input matches UUID pattern or Tracking Code pattern
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      query.idOrTrackingCode
    );

    if (isUuid) {
      complaint = await this.complaintRepo.findById(new ComplaintId(query.idOrTrackingCode));
    } else {
      try {
        const trackingCode = new TrackingCode(query.idOrTrackingCode);
        complaint = await this.complaintRepo.findByTrackingCode(trackingCode);
      } catch {
        return err(new ComplaintNotFoundError(query.idOrTrackingCode));
      }
    }

    if (!complaint) {
      return err(new ComplaintNotFoundError(query.idOrTrackingCode));
    }

    // Enforce 4-dimensional authorization check (BOLA/IDOR protection)
    const authCheck = AuthorizationPolicy.canExecute(
      query.actor,
      DomainOperation.VIEW,
      complaint.toResourceContext()
    );

    if (authCheck.isFailure) {
      return err(authCheck.error as AppError);
    }

    return ok(complaint);
  }
}
