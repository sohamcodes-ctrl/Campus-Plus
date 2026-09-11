import { ISODateTimeString } from "@/shared/types/common";
import { Result } from "@/domain/common/Result";
import { ReopenWindowExpiredError } from "../DomainErrors";

export interface IReopenPolicyContext {
  readonly resolvedAt: ISODateTimeString;
  readonly now: ISODateTimeString;
}

/**
 * Reopen Policy Interface.
 * Evaluates whether a complaint in RESOLVED status can legally be reopened based on institutional
 * working days, calendar holidays, and the verification window (BR-016, BR-018, OD-008).
 * Callers cannot bypass or hardcode hours.
 */
export interface IReopenPolicy {
  isEligibleToReopen(context: IReopenPolicyContext): Promise<Result<boolean, ReopenWindowExpiredError>>;
}
