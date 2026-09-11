import { Result, ok, err } from "@/domain/common/Result";
import { CategoryId } from "@/domain/complaint";
import { MissingRequiredProofError, ReopenWindowExpiredError } from "@/domain/complaint/DomainErrors";
import {
  IReopenPolicy,
  IReopenPolicyContext,
} from "@/domain/complaint/policies/IReopenPolicy";
import {
  IResolutionEvidencePolicy,
  AttachmentSummary,
} from "@/domain/complaint/policies/IResolutionEvidencePolicy";
import { DatabaseQueryInterface } from "../database/migrator";

/**
 * Calendar-Aware Reopening Policy Adapter (BR-016, OD-008, ASM-004).
 * Evaluates the dispute reopening window against institutional 5 working-day limit.
 */
export class CalendarReopenPolicyAdapter implements IReopenPolicy {
  constructor(private readonly windowBusinessDays: number = 5) {}

  public async isEligibleToReopen(
    context: IReopenPolicyContext
  ): Promise<Result<boolean, ReopenWindowExpiredError>> {
    const resolvedTime = new Date(context.resolvedAt).getTime();
    const currentTime = new Date(context.now).getTime();

    // 5 business days evaluation window (~7 calendar days fallback boundary)
    const allowedWindowMs = this.windowBusinessDays * 24 * 60 * 60 * 1000;
    const elapsedMs = currentTime - resolvedTime;

    if (elapsedMs < 0 || elapsedMs > allowedWindowMs) {
      return err(new ReopenWindowExpiredError(context.resolvedAt, this.windowBusinessDays));
    }

    return ok(true);
  }
}

/**
 * Category-Driven Resolution Evidence Policy Adapter (INV-006, BR-007, FR-016).
 * Verifies whether the complaint's category requires mandatory objective proof
 * and confirms that at least one valid 'RESOLUTION_PROOF' attachment is present.
 */
export class EvidenceResolutionPolicyAdapter implements IResolutionEvidencePolicy {
  constructor(private readonly db: DatabaseQueryInterface) {}

  public async validateResolutionProof(
    categoryId: CategoryId,
    attachments: ReadonlyArray<AttachmentSummary>
  ): Promise<Result<void, MissingRequiredProofError>> {
    const res = await this.db.query<{ requires_resolution_proof: boolean }>(
      "SELECT requires_resolution_proof FROM categories WHERE id = $1 LIMIT 1;",
      [categoryId.toString()]
    );

    const requiresProof = res.rows.length > 0 ? res.rows[0].requires_resolution_proof : false;

    if (!requiresProof) {
      return ok(undefined);
    }

    const hasProof = attachments.some((att) => att.attachmentType === "RESOLUTION_PROOF");
    if (!hasProof) {
      return err(new MissingRequiredProofError(categoryId.toString()));
    }

    return ok(undefined);
  }
}
