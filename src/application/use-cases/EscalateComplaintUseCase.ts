import { UseCase } from "../common/UseCase";
import { IComplaintRepository } from "../ports/IComplaintRepository";
import {
  ComplaintId,
  EscalationTierType,
  ActorContext,
  BusinessInvariants,
} from "@/domain/complaint";
import { Result, ok, err } from "@/domain/common/Result";
import { AppError } from "@/shared/errors/AppError";
import { ComplaintNotFoundError } from "@/domain/complaint/DomainErrors";

export interface EscalateComplaintCommand {
  complaintId: string;
  toTier: EscalationTierType;
  actor: ActorContext;
  reason: string;
  expectedVersion?: number;
}

export class EscalateComplaintUseCase implements UseCase<EscalateComplaintCommand, Result<void, AppError>> {
  constructor(private readonly complaintRepo: IComplaintRepository) {}

  public async execute(command: EscalateComplaintCommand): Promise<Result<void, AppError>> {
    const complaintId = new ComplaintId(command.complaintId);
    const complaint = await this.complaintRepo.findById(complaintId);

    if (!complaint) {
      return err(new ComplaintNotFoundError(command.complaintId));
    }

    const occCheck = BusinessInvariants.validateConcurrency(complaint.version.toNumber(), command.expectedVersion);
    if (occCheck.isFailure) {
      return err(occCheck.error);
    }

    const escalateResult = complaint.manualEscalate(command.actor, command.toTier, command.reason);
    if (escalateResult.isFailure) {
      return err(escalateResult.error as AppError);
    }

    await this.complaintRepo.save(complaint, command.expectedVersion);
    return ok(undefined);
  }
}
