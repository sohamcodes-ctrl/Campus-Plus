import { NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/container";
import { PresignUploadSchema } from "@/presentation/schemas/complaintSchemas";
import { createSuccessResponse } from "@/presentation/utils/apiResponse";
import { handleApiError } from "@/presentation/utils/errorHandler";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const container = await getContainer();
    const actor = await container.authAdapter.authenticate(request);

    const body = await request.json();
    const validated = PresignUploadSchema.parse(body);

    const result = await container.storageAdapter.generateUploadUrl({
      filename: validated.filename,
      contentType: validated.mimeType,
      sizeBytes: validated.fileSizeBytes,
    });

    await container.db.query(
      `INSERT INTO temporary_attachment_uploads
        (storage_key, uploaded_by_id, original_filename, mime_type, file_size_bytes, expires_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP + INTERVAL '1 hour');`,
      [result.fileKey, actor.userId, validated.filename, validated.mimeType, validated.fileSizeBytes]
    );

    return createSuccessResponse(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
