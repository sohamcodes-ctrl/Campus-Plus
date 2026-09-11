import { UseCase } from "../common/UseCase";
import { IComplaintRepository } from "../ports/IComplaintRepository";
import { ComplaintId, ActorContext, BusinessInvariants } from "@/domain/complaint";
import { Result, ok, err } from "@/domain/common/Result";
import { AppError } from "@/shared/errors/AppError";
import { ComplaintNotFoundError } from "@/domain/complaint/DomainErrors";

export interface CancelComplaintCommand {
  complaintId: string;
  actor: ActorContext;
  reason: string;
  expectedVersion?: number;
}

/**
 * Cancel Complaint Use Case (BR-005, INV-008).
 * Permits the original complainant to cancel a complaint prior to staff triage (SUBMITTED/DRAFT).
 */
export class CancelComplaintUseCase implements UseCase<CancelComplaintCommand, Result<void, AppError>> {
  constructor(private readonly complaintRepo: IComplaintRepository) {}

  public async execute(command: CancelComplaintCommand): Promise<Result<void, AppError>> {
    const complaintId = new ComplaintId(command.complaintId);
    const complaint = await this.complaintRepo.findById(complaintId);

    if (!complaint) {
      return err(new ComplaintNotFoundError(command.complaintId));
    }

    const occCheck = BusinessInvariants.validateConcurrency(complaint.version.toNumber(), command.expectedVersion);
    if (occCheck.isFailure) {
      return err(occCheck.error);
    }

    const cancelResult = complaint.cancel(command.actor, command.reason);
    if (cancelResult.isFailure) {
      return err(cancelResult.error as AppError);
    }

    await this.complaintRepo.save(complaint, command.expectedVersion);
    return ok(undefined);
  }
}
