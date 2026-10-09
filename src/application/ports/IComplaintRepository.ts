import { Complaint, ComplaintId, TrackingCode } from "@/domain/complaint";

export interface ComplaintAttachmentInput {
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  attachmentType?: "INITIAL_EVIDENCE" | "RESOLUTION_PROOF";
}

export interface IComplaintRepository {
  findById(id: ComplaintId): Promise<Complaint | null>;
  findByTrackingCode(code: TrackingCode): Promise<Complaint | null>;
  save(complaint: Complaint, expectedVersion?: number): Promise<void>;
  saveWithAttachments?(
    complaint: Complaint,
    attachments: ComplaintAttachmentInput[],
    expectedVersion?: number
  ): Promise<void>;
}
