import { UseCase } from "../common/UseCase";
import { IComplaintRepository } from "../ports/IComplaintRepository";
import { ComplaintId, ActorContext, BusinessInvariants } from "@/domain/complaint";
import { Result, ok, err } from "@/domain/common/Result";
import { AppError } from "@/shared/errors/AppError";
import { ComplaintNotFoundError } from "@/domain/complaint/DomainErrors";

export interface RejectComplaintCommand {
  complaintId: string;
  actor: ActorContext;
  reason: string;
  expectedVersion?: number;
}

export class RejectComplaintUseCase implements UseCase<RejectComplaintCommand, Result<void, AppError>> {
  constructor(private readonly complaintRepo: IComplaintRepository) {}

  public async execute(command: RejectComplaintCommand): Promise<Result<void, AppError>> {
    const complaintId = new ComplaintId(command.complaintId);
    const complaint = await this.complaintRepo.findById(complaintId);

    if (!complaint) {
      return err(new ComplaintNotFoundError(command.complaintId));
    }

    const occCheck = BusinessInvariants.validateConcurrency(complaint.version.toNumber(), command.expectedVersion);
    if (occCheck.isFailure) {
      return err(occCheck.error);
    }

    const rejectResult = complaint.reject(command.actor, command.reason);
    if (rejectResult.isFailure) {
      return err(rejectResult.error as AppError);
    }

    await this.complaintRepo.save(complaint, command.expectedVersion);
    return ok(undefined);
  }
}
