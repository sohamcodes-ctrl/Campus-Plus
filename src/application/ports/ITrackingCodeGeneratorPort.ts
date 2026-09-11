import { TrackingCode } from "@/domain/complaint";

/**
 * Concurrency-safe Tracking Code Generator Port.
 * Generates unique institutional identifiers (CP-YYYY-XXXXX) using atomic sequences or concurrency-safe allocation.
 * Decoupled from repository SELECT MAX race conditions.
 */
export interface ITrackingCodeGeneratorPort {
  generate(): Promise<TrackingCode>;
}
