import { ID } from "@/shared/types/common";

export interface FileMetadata {
  filename: string;
  contentType: string;
  sizeBytes: number;
}

export interface UploadPresignedUrlResult {
  uploadUrl: string;
  fileKey: string;
  expiresInSeconds: number;
}

export interface StoragePort {
  generateUploadUrl(metadata: FileMetadata): Promise<UploadPresignedUrlResult>;
  getDownloadUrl(fileKey: string): Promise<string>;
  deleteFile(fileKey: string): Promise<void>;
}

export interface NotificationMessage {
  recipientId: ID;
  recipientEmail?: string;
  subject: string;
  body: string;
  templateId?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPort {
  sendEmail(message: NotificationMessage): Promise<void>;
  sendInAppNotification(message: NotificationMessage): Promise<void>;
}
