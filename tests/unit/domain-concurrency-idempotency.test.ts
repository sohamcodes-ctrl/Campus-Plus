import { describe, it, expect } from "vitest";
import {
  Complaint,
  ComplaintStatus,
  UserRole,
  ActorContext,
  ComplaintId,
  TrackingCode,
  StaleVersionConflictError,
  IdempotencyConflictError,
} from "@/domain/complaint";
import { IIdempotencyPort } from "@/application/ports/IIdempotencyPort";
import { IComplaintRepository } from "@/application/ports/IComplaintRepository";
import { ReviewComplaintUseCase } from "@/application/use-cases/ReviewComplaintUseCase";
import { Result } from "@/domain/common/Result";

function getError<T, E>(result: Result<T, E>): E {
  if (result.isFailure) return result.error;
  throw new Error("Expected Result to be a failure");
}

interface IdempotencyEntry {
  requestHash: string;
  status: "IN_PROGRESS" | "COMPLETED";
  responseCode?: number;
  responseBody?: unknown;
}

// In-Memory Test Implementation of IIdempotencyPort
class InMemoryIdempotencyAdapter implements IIdempotencyPort {
  private records = new Map<string, IdempotencyEntry>();

  async acquireKey(key: string, requestHash: string): Promise<boolean> {
    const existing = this.records.get(key);
    if (existing) {
      if (existing.status === "IN_PROGRESS" || existing.requestHash !== requestHash) {
        throw new IdempotencyConflictError(key);
      }
      return false; // Already completed with same hash
    }

    this.records.set(key, {
      requestHash,
      status: "IN_PROGRESS",
    });
    return true; // Acquired
  }

  async completeKey(key: string, responseCode: number, responseBody: unknown): Promise<void> {
    const existing = this.records.get(key);
    if (!existing) {
      throw new Error(`Cannot complete unacquired key '${key}'`);
    }
    existing.status = "COMPLETED";
    existing.responseCode = responseCode;
    existing.responseBody = responseBody;
  }

  async getExistingResponse(key: string): Promise<{ responseCode: number; responseBody: unknown } | null> {
    const existing = this.records.get(key);
    if (existing && existing.status === "COMPLETED") {
      return {
        responseCode: existing.responseCode ?? 200,
        responseBody: existing.responseBody,
      };
    }
    return null;
  }
}

// In-Memory Test Implementation of IComplaintRepository with OCC
class InMemoryComplaintRepository implements IComplaintRepository {
  private storage = new Map<string, Complaint>();

  async findById(id: ComplaintId): Promise<Complaint | null> {
    const complaint = this.storage.get(id.toString());
    return complaint ?? null;
  }

  async findByTrackingCode(code: TrackingCode): Promise<Complaint | null> {
    for (const complaint of this.storage.values()) {
      if (complaint.refId.toString() === code.toString()) {
        return complaint;
      }
    }
    return null;
  }

  async save(complaint: Complaint, expectedVersion?: number): Promise<void> {
    const existing = this.storage.get(complaint.id.toString());
    if (existing && expectedVersion !== undefined) {
      const previousVersion = complaint.version.toNumber() - 1;
      if (previousVersion !== expectedVersion) {
        throw new StaleVersionConflictError(previousVersion, expectedVersion);
      }
    }
    this.storage.set(complaint.id.toString(), complaint);
  }

  async exists(id: ComplaintId): Promise<boolean> {
    return this.storage.has(id.toString());
  }

  public seed(complaint: Complaint): void {
    this.storage.set(complaint.id.toString(), complaint);
  }
}

describe("Domain Concurrency & Idempotency Suite (INV-009 & INV-013)", () => {
  const deptId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const complainantId = "11111111-1111-4111-8111-111111111111";

  const deptHead: ActorContext = {
    userId: "22222222-2222-4222-8222-222222222222",
    role: UserRole.ROLE_DEPT_HEAD,
    departmentId: deptId,
  };

  function createTestComplaint(id = "99999999-9999-4999-8999-999999999999"): Complaint {
    const res = Complaint.create({
      id,
      refId: "CP-2026-00001",
      title: "Broken water cooler in main faculty lounge",
      description: "Water is leaking continuously onto the electrical fixtures below.",
      complainantId,
      departmentId: deptId,
      categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      locationDetails: "Faculty Lounge 2nd Floor",
    });
    if (res.isFailure) throw res.error;
    return res.value;
  }

  // ---------------------------------------------------------------------------
  // 1. Optimistic Concurrency Control (OCC) Tests (INV-009)
  // ---------------------------------------------------------------------------
  describe("Optimistic Concurrency Control (OCC) via Use Cases", () => {
    it("should succeed and increment version when expectedVersion matches database version", async () => {
      const repo = new InMemoryComplaintRepository();
      const complaint = createTestComplaint();
      repo.seed(complaint);
      expect(complaint.version.toNumber()).toBe(1);

      const useCase = new ReviewComplaintUseCase(repo);
      const result = await useCase.execute({
        complaintId: complaint.id.toString(),
        actor: deptHead,
        expectedVersion: 1,
      });

      expect(result.isSuccess).toBe(true);
      const updated = await repo.findById(complaint.id);
      expect(updated?.version.toNumber()).toBe(2);
      expect(updated?.status).toBe(ComplaintStatus.REVIEWED);
    });

    it("should reject update when expectedVersion is stale (OCC Conflict)", async () => {
      const repo = new InMemoryComplaintRepository();
      const complaint = createTestComplaint();
      repo.seed(complaint);

      const useCase = new ReviewComplaintUseCase(repo);
      // Expected version is 999, but entity is at version 1
      const result = await useCase.execute({
        complaintId: complaint.id.toString(),
        actor: deptHead,
        expectedVersion: 999,
      });

      expect(result.isFailure).toBe(true);
      expect(getError(result)).toBeInstanceOf(StaleVersionConflictError);

      // State remains unaltered
      const pristine = await repo.findById(complaint.id);
      expect(pristine?.version.toNumber()).toBe(1);
      expect(pristine?.status).toBe(ComplaintStatus.SUBMITTED);
    });

    it("should handle race condition between two concurrent callers", async () => {
      const repo = new InMemoryComplaintRepository();
      const complaint = createTestComplaint();
      repo.seed(complaint);

      const useCase = new ReviewComplaintUseCase(repo);

      // Caller 1 and Caller 2 both read version 1 concurrently
      const command1 = {
        complaintId: complaint.id.toString(),
        actor: deptHead,
        expectedVersion: 1,
      };
      const command2 = {
        complaintId: complaint.id.toString(),
        actor: deptHead,
        expectedVersion: 1,
      };

      // Caller 1 executes first and commits
      const result1 = await useCase.execute(command1);
      expect(result1.isSuccess).toBe(true);

      // Caller 2 tries to commit with stale version 1
      const result2 = await useCase.execute(command2);
      expect(result2.isFailure).toBe(true);
      expect(getError(result2)).toBeInstanceOf(StaleVersionConflictError);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Command Idempotency Tests (INV-013)
  // ---------------------------------------------------------------------------
  describe("Command Idempotency Protocol (INV-013)", () => {
    it("should acquire key on first attempt and complete execution", async () => {
      const idempotency = new InMemoryIdempotencyAdapter();
      const acquired = await idempotency.acquireKey("key-1", "hash-abc");
      expect(acquired).toBe(true);

      await idempotency.completeKey("key-1", 200, { trackingCode: "CP-2026-00001" });
      const cached = await idempotency.getExistingResponse("key-1");
      expect(cached).toEqual({ responseCode: 200, responseBody: { trackingCode: "CP-2026-00001" } });
    });

    it("should return false on acquire if already completed with identical hash", async () => {
      const idempotency = new InMemoryIdempotencyAdapter();
      await idempotency.acquireKey("key-replay", "hash-abc");
      await idempotency.completeKey("key-replay", 200, { data: "Success" });

      const acquiredAgain = await idempotency.acquireKey("key-replay", "hash-abc");
      expect(acquiredAgain).toBe(false);

      const cached = await idempotency.getExistingResponse("key-replay");
      expect(cached?.responseBody).toEqual({ data: "Success" });
    });

    it("should reject replayed request if payload hash differs (Key Hijack Protection)", async () => {
      const idempotency = new InMemoryIdempotencyAdapter();
      await idempotency.acquireKey("key-tamper", "hash-original");
      await idempotency.completeKey("key-tamper", 200, { ok: true });

      await expect(
        idempotency.acquireKey("key-tamper", "hash-tampered")
      ).rejects.toThrow(IdempotencyConflictError);
    });

    it("should reject concurrent duplicate request while status is IN_PROGRESS", async () => {
      const idempotency = new InMemoryIdempotencyAdapter();
      await idempotency.acquireKey("key-in-flight", "hash-flight");

      await expect(
        idempotency.acquireKey("key-in-flight", "hash-flight")
      ).rejects.toThrow(IdempotencyConflictError);
    });
  });
});
