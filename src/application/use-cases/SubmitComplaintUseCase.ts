import { createHash } from "node:crypto";
import { UseCase } from "../common/UseCase";
import { ComplaintAttachmentInput, IComplaintRepository } from "../ports/IComplaintRepository";
import { ITrackingCodeGeneratorPort } from "../ports/ITrackingCodeGeneratorPort";
import { IIdempotencyPort } from "../ports/IIdempotencyPort";
import { Complaint } from "@/domain/complaint";
import { Result, ok, err } from "@/domain/common/Result";
import { AppError } from "@/shared/errors/AppError";
import { IdempotencyConflictError } from "@/domain/complaint/DomainErrors";

export interface SubmitComplaintCommand {
  complainantId: string;
  departmentId: string;
  categoryId: string;
  title: string;
  description: string;
  locationDetails: string;
  locationId?: string;
  suggestedPriority?: string;
  idempotencyKey?: string;
  attachments?: ComplaintAttachmentInput[];
}

export interface SubmitComplaintResult {
  complaintId: string;
  trackingCode: string;
  status: string;
}

export class SubmitComplaintUseCase implements UseCase<SubmitComplaintCommand, Result<SubmitComplaintResult, AppError>> {
  constructor(
    private readonly complaintRepo: IComplaintRepository,
    private readonly codeGenerator: ITrackingCodeGeneratorPort,
    private readonly idempotencyPort?: IIdempotencyPort
  ) {}

  public async execute(command: SubmitComplaintCommand): Promise<Result<SubmitComplaintResult, AppError>> {
    // 1. Idempotency Check
    if (command.idempotencyKey && this.idempotencyPort) {
      const rawPayload = JSON.stringify({
        title: command.title,
        complainantId: command.complainantId,
        departmentId: command.departmentId,
        categoryId: command.categoryId,
        description: command.description,
        locationDetails: command.locationDetails,
      });
      const requestHash = createHash("sha256").update(rawPayload).digest("hex");
      const acquired = await this.idempotencyPort.acquireKey(command.idempotencyKey, requestHash);
      if (!acquired) {
        const existing = await this.idempotencyPort.getExistingResponse(command.idempotencyKey);
        if (existing) {
          return ok(existing.responseBody as SubmitComplaintResult);
        }
        return err(new IdempotencyConflictError(command.idempotencyKey));
      }
    }

    // 2. Concurrency-Safe Tracking Code Generation
    const trackingCode = await this.codeGenerator.generate();

    // 3. Domain Aggregate Creation
    const complaintResult = Complaint.create({
      refId: trackingCode.toString(),
      title: command.title,
      description: command.description,
      complainantId: command.complainantId,
      departmentId: command.departmentId,
      categoryId: command.categoryId,
      locationDetails: command.locationDetails,
      locationId: command.locationId,
      suggestedPriority: command.suggestedPriority,
    });

    if (complaintResult.isFailure) {
      return err(complaintResult.error as AppError);
    }

    const complaint = complaintResult.value;

    // 4. Persistence
    if (this.complaintRepo.saveWithAttachments) {
      await this.complaintRepo.saveWithAttachments(complaint, command.attachments ?? []);
    } else {
      await this.complaintRepo.save(complaint);
    }

    const result: SubmitComplaintResult = {
      complaintId: complaint.id.toString(),
      trackingCode: complaint.refId.toString(),
      status: complaint.status,
    };

    // 5. Complete Idempotency Token
    if (command.idempotencyKey && this.idempotencyPort) {
      await this.idempotencyPort.completeKey(command.idempotencyKey, 201, result);
    }

    return ok(result);
  }
}
