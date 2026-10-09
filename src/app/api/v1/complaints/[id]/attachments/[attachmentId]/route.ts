import { NextRequest } from "next/server";
import { UserRole } from "@/domain/complaint";
import { getContainer } from "@/infrastructure/container";
import { AuthorizationError, NotFoundError } from "@/shared/errors/AppError";
import { createSuccessResponse } from "@/presentation/utils/apiResponse";
import { handleApiError } from "@/presentation/utils/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; attachmentId: string }> }
) {
  try {
    const container = await getContainer();
    const actor = await container.authAdapter.authenticate(request);
    const { id, attachmentId } = await context.params;
    const result = await container.db.query<{
      storage_key: string;
      original_filename: string;
      mime_type: string;
      complainant_id: string;
      department_id: string;
      assigned_handler_id: string | null;
    }>(
      `SELECT a.storage_key, a.original_filename, a.mime_type,
              c.complainant_id, c.department_id, c.assigned_handler_id
       FROM attachments a
       INNER JOIN complaints c ON c.id = a.complaint_id
       WHERE a.id = $1 AND a.complaint_id = $2
       LIMIT 1;`,
      [attachmentId, id]
    );

    const attachment = result.rows[0];
    if (!attachment) throw new NotFoundError("Attachment", attachmentId);

    const isPrivileged = actor.role === UserRole.ROLE_ADMIN || actor.role === UserRole.ROLE_MANAGEMENT;
    const isOwner = attachment.complainant_id === actor.userId;
    const isAssignedHandler = attachment.assigned_handler_id === actor.userId;
    const isDepartmentMember = actor.departmentId === attachment.department_id && actor.role !== UserRole.ROLE_STUDENT;
    if (!isPrivileged && !isOwner && !isAssignedHandler && !isDepartmentMember) {
      throw new AuthorizationError("You do not have permission to view this attachment.");
    }

    const downloadUrl = await container.storageAdapter.getDownloadUrl(attachment.storage_key);
    return createSuccessResponse({
      downloadUrl,
      filename: attachment.original_filename,
      mimeType: attachment.mime_type,
    });
  } catch (error) {
    return handleApiError(error);
  }
}