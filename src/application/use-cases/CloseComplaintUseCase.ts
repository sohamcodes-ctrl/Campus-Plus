import { UseCase } from "../common/UseCase";
import { IComplaintRepository } from "../ports/IComplaintRepository";
import { ComplaintId, ActorContext, BusinessInvariants } from "@/domain/complaint";
import { Result, ok, err } from "@/domain/common/Result";
import { AppError } from "@/shared/errors/AppError";
import { ComplaintNotFoundError } from "@/domain/complaint/DomainErrors";

export interface CloseComplaintCommand {
  complaintId: string;
  actor: ActorContext;
  reason: string;
  isComplainantVerification?: boolean;
  expectedVersion?: number;
}

export class CloseComplaintUseCase implements UseCase<CloseComplaintCommand, Result<void, AppError>> {
  constructor(private readonly complaintRepo: IComplaintRepository) {}

  public async execute(command: CloseComplaintCommand): Promise<Result<void, AppError>> {
    const complaintId = new ComplaintId(command.complaintId);
    const complaint = await this.complaintRepo.findById(complaintId);

    if (!complaint) {
      return err(new ComplaintNotFoundError(command.complaintId));
    }

    const occCheck = BusinessInvariants.validateConcurrency(complaint.version.toNumber(), command.expectedVersion);
    if (occCheck.isFailure) {
      return err(occCheck.error);
    }

    const closeResult = command.isComplainantVerification
      ? complaint.verifyResolution(command.actor)
      : complaint.close(command.actor, command.reason);

    if (closeResult.isFailure) {
      return err(closeResult.error as AppError);
    }

    await this.complaintRepo.save(complaint, command.expectedVersion);
    return ok(undefined);
  }
}
