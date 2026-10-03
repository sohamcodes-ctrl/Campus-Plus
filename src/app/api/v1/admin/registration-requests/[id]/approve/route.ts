import { NextRequest } from "next/server";
import { UserRole } from "@/domain/complaint";
import { getContainer } from "@/infrastructure/container";
import { executeTransaction } from "@/infrastructure/database/pool";
import { AuthorizationError, NotFoundError } from "@/shared/errors/AppError";
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
    if (actor.role !== UserRole.ROLE_ADMIN) {
      throw new AuthorizationError("Only administrators can approve account enrollment requests.");
    }

    const { id } = await context.params;
    const result = await executeTransaction(async (tx) => {
      const requestResult = await tx.query<{
        email: string;
        full_name: string;
        roll_or_prn: string | null;
        department_id: string | null;
        requested_role: string;
        auth_user_id: string | null;
        status: string;
      }>(
        `SELECT email, full_name, roll_or_prn, department_id, requested_role, auth_user_id, status
         FROM registration_requests WHERE id = $1 FOR UPDATE;`,
        [id]
      );

      const enrollment = requestResult.rows[0];
      if (!enrollment) throw new NotFoundError("Registration request", id);
      if (enrollment.status !== "PENDING_VERIFICATION" || !enrollment.auth_user_id) {
        throw new AuthorizationError("This enrollment request is not awaiting approval.");
      }

      await tx.query(
        `INSERT INTO users (id, email, full_name, roll_or_prn, is_active)
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, roll_or_prn = EXCLUDED.roll_or_prn, is_active = TRUE;`,
        [enrollment.auth_user_id, enrollment.email, enrollment.full_name, enrollment.roll_or_prn]
      );
      await tx.query(
        `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
        [enrollment.auth_user_id, enrollment.requested_role]
      );
      if (enrollment.department_id) {
        await tx.query(
          `INSERT INTO department_memberships (user_id, department_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
          [enrollment.auth_user_id, enrollment.department_id]
        );
      }
      await tx.query(
        `UPDATE registration_requests SET status = 'PROVISIONED', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2 WHERE id = $1;`,
        [id, actor.userId]
      );

      return { userId: enrollment.auth_user_id, status: "PROVISIONED" };
    });

    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}