import { NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/container";
import { PresignUploadSchema } from "@/presentation/schemas/complaintSchemas";
import { createSuccessResponse } from "@/presentation/utils/apiResponse";
import { handleApiError } from "@/presentation/utils/errorHandler";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const container = await getContainer();
    await container.authAdapter.authenticate(request);

    const body = await request.json();
    const validated = PresignUploadSchema.parse(body);

    const result = await container.storageAdapter.generateUploadUrl({
      filename: validated.filename,
      contentType: validated.mimeType,
      sizeBytes: validated.fileSizeBytes,
    });

    return createSuccessResponse(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
