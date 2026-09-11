import { Complaint, ComplaintId, TrackingCode } from "@/domain/complaint";

export interface IComplaintRepository {
  findById(id: ComplaintId): Promise<Complaint | null>;
  findByTrackingCode(code: TrackingCode): Promise<Complaint | null>;
  save(complaint: Complaint, expectedVersion?: number): Promise<void>;
}
