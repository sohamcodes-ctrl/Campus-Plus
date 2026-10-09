import { NextRequest } from "next/server";
import { env } from "@/config/env";
import { getContainer } from "@/infrastructure/container";
import { createSuccessResponse } from "@/presentation/utils/apiResponse";
import { handleApiError } from "@/presentation/utils/errorHandler";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    if (authorization !== `Bearer ${env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const container = await getContainer();
    const expired = await container.db.query<{ id: string; storage_key: string }>(
      `SELECT id, storage_key FROM temporary_attachment_uploads
       WHERE expires_at <= CURRENT_TIMESTAMP ORDER BY expires_at ASC LIMIT 500;`
    );

    let deleted = 0;
    for (const upload of expired.rows) {
      await container.storageAdapter.deleteFile(upload.storage_key);
      await container.db.query("DELETE FROM temporary_attachment_uploads WHERE id = $1;", [upload.id]);
      deleted += 1;
    }

    return createSuccessResponse({ deleted });
  } catch (error) {
    return handleApiError(error);
  }
}