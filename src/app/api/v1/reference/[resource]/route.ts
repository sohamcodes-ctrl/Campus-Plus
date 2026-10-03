import { NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/container";
import { createSuccessResponse } from "@/presentation/utils/apiResponse";
import { handleApiError } from "@/presentation/utils/errorHandler";

export const dynamic = "force-dynamic";

type Resource = "categories" | "departments" | "locations" | "handlers" | "sla-policies";

const queries: Record<Resource, string> = {
  categories: `SELECT id, name, description, default_department_id AS "defaultDepartmentId", requires_resolution_proof AS "requiresResolutionProof"
               FROM categories WHERE is_active = TRUE ORDER BY name ASC;`,
  departments: `SELECT id, code, name, description, contact_email AS "contactEmail"
                FROM departments WHERE is_active = TRUE ORDER BY name ASC;`,
  locations: `SELECT id, campus, building, block, floor, room_or_area AS "roomOrArea"
              FROM locations WHERE is_active = TRUE ORDER BY campus, building, block, floor, room_or_area;`,
  handlers: `SELECT u.id, u.full_name AS "fullName", u.email, dm.department_id AS "departmentId"
             FROM users u
             INNER JOIN user_roles ur ON ur.user_id = u.id AND ur.role_id IN ('ROLE_HANDLER', 'ROLE_DEPT_HEAD')
             INNER JOIN department_memberships dm ON dm.user_id = u.id AND dm.is_active = TRUE
             WHERE u.is_active = TRUE ORDER BY u.full_name ASC;`,
  "sla-policies": `SELECT id, category_id AS "categoryId", priority,
                    response_threshold_hours AS "responseThresholdHours",
                    resolution_threshold_hours AS "resolutionThresholdHours",
                    escalation_target_tier AS "escalationTargetTier"
                   FROM sla_policies ORDER BY category_id, priority;`,
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  try {
    const container = await getContainer();
    await container.authAdapter.authenticate(request);
    const { resource } = await context.params;

    if (!(resource in queries)) {
      return createSuccessResponse({ error: "Unknown reference resource." }, { status: 404 });
    }

    const result = await container.db.query<Record<string, unknown>>(queries[resource as Resource]);
    return createSuccessResponse(result.rows);
  } catch (error) {
    return handleApiError(error);
  }
}