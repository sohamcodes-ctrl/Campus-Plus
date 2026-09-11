import { Result } from "@/domain/common/Result";
import { CategoryId } from "../ValueObjects";
import { MissingRequiredProofError } from "../DomainErrors";
import { AttachmentTypeType } from "../ComplaintTypes";

export interface AttachmentSummary {
  readonly id: string;
  readonly attachmentType: AttachmentTypeType;
  readonly originalFilename: string;
  readonly mimeType: string;
}

/**
 * Resolution Evidence Policy Interface.
 * Evaluates whether a complaint's category requires mandatory objective proof (INV-006 / BR-007 / FR-016),
 * and verifies whether at least one valid 'RESOLUTION_PROOF' attachment has been provided.
 * Callers cannot bypass this check via arbitrary flags.
 */
export interface IResolutionEvidencePolicy {
  validateResolutionProof(
    categoryId: CategoryId,
    attachments: ReadonlyArray<AttachmentSummary>
  ): Promise<Result<void, MissingRequiredProofError>>;
}
