import { FileMetadata, StoragePort, UploadPresignedUrlResult } from "@/application/ports/ExternalPorts";
import { generateCorrelationId } from "@/shared/utils/id";

/**
 * Mock / In-Memory Storage Adapter for testing and local execution without cloud dependencies.
 */
export class InMemoryStorageAdapter implements StoragePort {
  private files: Map<string, { metadata: FileMetadata; data?: Buffer }> = new Map();

  async generateUploadUrl(metadata: FileMetadata): Promise<UploadPresignedUrlResult> {
    const fileKey = `uploads/${Date.now()}-${generateCorrelationId().slice(0, 8)}-${metadata.filename}`;
    this.files.set(fileKey, { metadata });
    return {
      uploadUrl: `https://storage.local.campusplus/upload/${fileKey}`,
      fileKey,
      expiresInSeconds: 3600,
    };
  }

  async getDownloadUrl(fileKey: string): Promise<string> {
    if (!this.files.has(fileKey)) {
      throw new Error(`File key '${fileKey}' not found in storage.`);
    }
    return `https://storage.local.campusplus/download/${fileKey}`;
  }

  async deleteFile(fileKey: string): Promise<void> {
    this.files.delete(fileKey);
  }
}
