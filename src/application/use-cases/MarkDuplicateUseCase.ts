import { UseCase } from "../common/UseCase";
import { IComplaintRepository } from "../ports/IComplaintRepository";
import { ComplaintId, ActorContext, BusinessInvariants } from "@/domain/complaint";
import { Result, ok, err } from "@/domain/common/Result";
import { AppError } from "@/shared/errors/AppError";
import { ComplaintNotFoundError } from "@/domain/complaint/DomainErrors";

export interface MarkDuplicateCommand {
  complaintId: string;
  actor: ActorContext;
  originalRefId: string;
  expectedVersion?: number;
}

/**
 * Mark Duplicate Complaint Use Case (BR-006).
 * Permits department triage staff (Head/Admin) to mark a complaint as duplicate of an existing master ticket.
 */
export class MarkDuplicateUseCase implements UseCase<MarkDuplicateCommand, Result<void, AppError>> {
  constructor(private readonly complaintRepo: IComplaintRepository) {}

  public async execute(command: MarkDuplicateCommand): Promise<Result<void, AppError>> {
    const complaintId = new ComplaintId(command.complaintId);
    const complaint = await this.complaintRepo.findById(complaintId);

    if (!complaint) {
      return err(new ComplaintNotFoundError(command.complaintId));
    }

    const occCheck = BusinessInvariants.validateConcurrency(complaint.version.toNumber(), command.expectedVersion);
    if (occCheck.isFailure) {
      return err(occCheck.error);
    }

    const duplicateResult = complaint.markDuplicate(command.actor, command.originalRefId);
    if (duplicateResult.isFailure) {
      return err(duplicateResult.error as AppError);
    }

    await this.complaintRepo.save(complaint, command.expectedVersion);
    return ok(undefined);
  }
}
