import { NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/container";
import { createSuccessResponse } from "@/presentation/utils/apiResponse";
import { handleApiError } from "@/presentation/utils/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const container = await getContainer();
    const actor = await container.authAdapter.authenticate(request);
    const result = await container.db.query<{
      id: string;
      complaint_id: string | null;
      title: string;
      message: string;
      is_read: boolean;
      read_at: string | null;
      created_at: string;
    }>(
      `SELECT id, complaint_id, title, message, is_read, read_at, created_at
       FROM notifications WHERE recipient_id = $1
       ORDER BY created_at DESC LIMIT 100;`,
      [actor.userId]
    );

    return createSuccessResponse({
      items: result.rows,
      unreadCount: result.rows.filter((notification) => !notification.is_read).length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}