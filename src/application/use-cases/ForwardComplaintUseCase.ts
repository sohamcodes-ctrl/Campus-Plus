import { UseCase } from "../common/UseCase";
import { IComplaintRepository } from "../ports/IComplaintRepository";
import {
  ComplaintId,
  DepartmentId,
  ForwardingRationale,
  ActorContext,
  BusinessInvariants,
} from "@/domain/complaint";
import { Result, ok, err } from "@/domain/common/Result";
import { AppError } from "@/shared/errors/AppError";
import { ComplaintNotFoundError } from "@/domain/complaint/DomainErrors";

export interface ForwardComplaintCommand {
  complaintId: string;
  toDepartmentId: string;
  actor: ActorContext;
  rationale: string;
  expectedVersion?: number;
}

export class ForwardComplaintUseCase implements UseCase<ForwardComplaintCommand, Result<void, AppError>> {
  constructor(private readonly complaintRepo: IComplaintRepository) {}

  public async execute(command: ForwardComplaintCommand): Promise<Result<void, AppError>> {
    const complaintId = new ComplaintId(command.complaintId);
    const complaint = await this.complaintRepo.findById(complaintId);

    if (!complaint) {
      return err(new ComplaintNotFoundError(command.complaintId));
    }

    const occCheck = BusinessInvariants.validateConcurrency(complaint.version.toNumber(), command.expectedVersion);
    if (occCheck.isFailure) {
      return err(occCheck.error);
    }

    const toDeptId = new DepartmentId(command.toDepartmentId);
    const rationale = new ForwardingRationale(command.rationale);

    const forwardResult = complaint.forwardDepartment(toDeptId, command.actor, rationale);
    if (forwardResult.isFailure) {
      return err(forwardResult.error as AppError);
    }

    await this.complaintRepo.save(complaint, command.expectedVersion);
    return ok(undefined);
  }
}
