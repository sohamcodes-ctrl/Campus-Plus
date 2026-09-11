import { UseCase } from "../common/UseCase";
import { IComplaintRepository } from "../ports/IComplaintRepository";
import {
  ComplaintId,
  ActorContext,
  BusinessInvariants,
  IReopenPolicy,
} from "@/domain/complaint";
import { Result, ok, err } from "@/domain/common/Result";
import { AppError } from "@/shared/errors/AppError";
import { ComplaintNotFoundError } from "@/domain/complaint/DomainErrors";

export interface ReopenComplaintCommand {
  complaintId: string;
  actor: ActorContext;
  disputeReason: string;
  expectedVersion?: number;
}

export class ReopenComplaintUseCase implements UseCase<ReopenComplaintCommand, Result<void, AppError>> {
  constructor(
    private readonly complaintRepo: IComplaintRepository,
    private readonly reopenPolicy: IReopenPolicy
  ) {}

  public async execute(command: ReopenComplaintCommand): Promise<Result<void, AppError>> {
    const complaintId = new ComplaintId(command.complaintId);
    const complaint = await this.complaintRepo.findById(complaintId);

    if (!complaint) {
      return err(new ComplaintNotFoundError(command.complaintId));
    }

    const occCheck = BusinessInvariants.validateConcurrency(complaint.version.toNumber(), command.expectedVersion);
    if (occCheck.isFailure) {
      return err(occCheck.error);
    }

    // Evaluate reopen eligibility via policy abstraction (BR-016 / BR-018 / OD-008)
    // Working days and calendar holidays are verified without caller-supplied hours.
    const now = new Date().toISOString();
    const policyResult = await this.reopenPolicy.isEligibleToReopen({
      resolvedAt: complaint.resolvedAt ?? complaint.createdAt,
      now,
    });

    if (policyResult.isFailure) {
      return err(policyResult.error);
    }

    const reopenResult = complaint.disputeAndReopen(
      command.actor,
      command.disputeReason,
      policyResult.value
    );

    if (reopenResult.isFailure) {
      return err(reopenResult.error as AppError);
    }

    await this.complaintRepo.save(complaint, command.expectedVersion);
    return ok(undefined);
  }
}
