import { UseCase } from "../common/UseCase";
import { IComplaintRepository } from "../ports/IComplaintRepository";
import {
  ComplaintId,
  ResolutionSummary,
  ActorContext,
  BusinessInvariants,
  IResolutionEvidencePolicy,
  AttachmentSummary,
} from "@/domain/complaint";
import { Result, ok, err } from "@/domain/common/Result";
import { AppError } from "@/shared/errors/AppError";
import { ComplaintNotFoundError } from "@/domain/complaint/DomainErrors";

export interface ResolveComplaintCommand {
  complaintId: string;
  resolvedBy: ActorContext;
  summary: string;
  attachments?: AttachmentSummary[];
  expectedVersion?: number;
}

export class ResolveComplaintUseCase implements UseCase<ResolveComplaintCommand, Result<void, AppError>> {
  constructor(
    private readonly complaintRepo: IComplaintRepository,
    private readonly evidencePolicy?: IResolutionEvidencePolicy
  ) {}

  public async execute(command: ResolveComplaintCommand): Promise<Result<void, AppError>> {
    const complaintId = new ComplaintId(command.complaintId);
    const complaint = await this.complaintRepo.findById(complaintId);

    if (!complaint) {
      return err(new ComplaintNotFoundError(command.complaintId));
    }

    const occCheck = BusinessInvariants.validateConcurrency(complaint.version.toNumber(), command.expectedVersion);
    if (occCheck.isFailure) {
      return err(occCheck.error);
    }

    // Invariant INV-006: Mandatory Resolution Proof for Designated Categories
    // Evaluated by policy abstraction; callers cannot bypass this check via arbitrary flags.
    if (this.evidencePolicy) {
      const proofResult = await this.evidencePolicy.validateResolutionProof(
        complaint.categoryId,
        command.attachments ?? []
      );
      if (proofResult.isFailure) {
        return err(proofResult.error);
      }
    }

    const summary = new ResolutionSummary(command.summary);
    const resolveResult = complaint.resolve(command.resolvedBy, summary);
    if (resolveResult.isFailure) {
      return err(resolveResult.error as AppError);
    }

    await this.complaintRepo.save(complaint, command.expectedVersion);
    return ok(undefined);
  }
}
