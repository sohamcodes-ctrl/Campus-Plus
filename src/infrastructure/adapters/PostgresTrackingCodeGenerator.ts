import { ITrackingCodeGeneratorPort } from "@/application/ports/ITrackingCodeGeneratorPort";
import { TrackingCode } from "@/domain/complaint";
import { DatabaseQueryInterface } from "../database/migrator";

/**
 * Concurrency-Safe Tracking Code Generator Adapter.
 * Backed by PostgreSQL sequence 'tracking_code_seq' to eliminate SELECT MAX + 1 race conditions.
 * Emits institutional tracking codes in format: CP-YYYY-XXXXX.
 */
export class PostgresTrackingCodeGenerator implements ITrackingCodeGeneratorPort {
  constructor(private readonly db: DatabaseQueryInterface) {}

  public async generate(): Promise<TrackingCode> {
    const result = await this.db.query<{ seq: string | number }>(
      "SELECT nextval('tracking_code_seq') AS seq;"
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error("Failed to allocate sequence value from 'tracking_code_seq'.");
    }

    const rawSeq = result.rows[0].seq;
    const seqNum = typeof rawSeq === "string" ? parseInt(rawSeq, 10) : rawSeq;
    const year = new Date().getFullYear();
    const formatted = `CP-${year}-${String(seqNum).padStart(5, "0")}`;

    return new TrackingCode(formatted);
  }
}
