import { NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/container";
import { createSuccessResponse } from "@/presentation/utils/apiResponse";
import { handleApiError } from "@/presentation/utils/errorHandler";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const container = await getContainer();
    const actor = await container.authAdapter.authenticate(request);
    const { id } = await context.params;
    const result = await container.db.query<{ id: string }>(
      `UPDATE notifications SET is_read = TRUE, read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
       WHERE id = $1 AND recipient_id = $2 RETURNING id;`,
      [id, actor.userId]
    );

    return createSuccessResponse({ markedRead: result.rows.length === 1 });
  } catch (error) {
    return handleApiError(error);
  }
}