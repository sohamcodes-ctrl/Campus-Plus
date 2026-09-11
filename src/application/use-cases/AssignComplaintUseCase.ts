import { UseCase } from "../common/UseCase";
import { IComplaintRepository } from "../ports/IComplaintRepository";
import { IDepartmentMembershipPort } from "../ports/IDepartmentMembershipPort";
import { ComplaintId, UserId, ActorContext, BusinessInvariants } from "@/domain/complaint";
import { Result, ok, err } from "@/domain/common/Result";
import { AppError } from "@/shared/errors/AppError";
import { ComplaintNotFoundError, DepartmentScopeViolationError } from "@/domain/complaint/DomainErrors";

export interface AssignComplaintCommand {
  complaintId: string;
  handlerId: string;
  assignedBy: ActorContext;
  reason?: string;
  expectedVersion?: number;
}

export class AssignComplaintUseCase implements UseCase<AssignComplaintCommand, Result<void, AppError>> {
  constructor(
    private readonly complaintRepo: IComplaintRepository,
    private readonly membershipPort?: IDepartmentMembershipPort
  ) {}

  public async execute(command: AssignComplaintCommand): Promise<Result<void, AppError>> {
    const complaintId = new ComplaintId(command.complaintId);
    const complaint = await this.complaintRepo.findById(complaintId);

    if (!complaint) {
      return err(new ComplaintNotFoundError(command.complaintId));
    }

    const occCheck = BusinessInvariants.validateConcurrency(complaint.version.toNumber(), command.expectedVersion);
    if (occCheck.isFailure) {
      return err(occCheck.error);
    }

    // Invariant INV-007: Jurisdictional Assignment Scope
    if (this.membershipPort) {
      const isMember = await this.membershipPort.isUserInDepartment(
        command.handlerId,
        complaint.departmentId.toString()
      );
      if (!isMember) {
        return err(
          new DepartmentScopeViolationError(
            command.handlerId,
            complaint.departmentId.toString(),
            `Handler '${command.handlerId}' does not belong to complaint owning department '${complaint.departmentId}' (INV-007).`
          )
        );
      }
    }

    const handlerId = new UserId(command.handlerId);
    const assignResult = complaint.assignHandler(handlerId, command.assignedBy, command.reason);
    if (assignResult.isFailure) {
      return err(assignResult.error as AppError);
    }

    await this.complaintRepo.save(complaint, command.expectedVersion);
    return ok(undefined);
  }
}
