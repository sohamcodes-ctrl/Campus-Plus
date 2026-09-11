/**
 * Idempotency Port (NFR-003 / ADR-006).
 * Manages request deduplication tokens preventing repeated executions from creating duplicate business effects.
 */
export interface IIdempotencyPort {
  acquireKey(key: string, requestHash: string): Promise<boolean>;
  completeKey(key: string, responseCode: number, responseBody: unknown): Promise<void>;
  getExistingResponse(key: string): Promise<{ responseCode: number; responseBody: unknown } | null>;
}
