import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/container";
import { env } from "@/config/env";
import { RegistrationRequestSchema } from "@/presentation/schemas/registrationSchemas";
import { createSuccessResponse } from "@/presentation/utils/apiResponse";
import { handleApiError } from "@/presentation/utils/errorHandler";

export const dynamic = "force-dynamic";

function configuredDomains(): string[] {
  return (env.INSTITUTIONAL_EMAIL_DOMAINS || "")
    .split(",")
    .map((domain) => domain.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);
}

export async function POST(request: NextRequest) {
  try {
    const body = RegistrationRequestSchema.parse(await request.json());
    const email = body.email.toLowerCase();
    const emailDomain = email.split("@")[1] || "";
    const domains = configuredDomains();

    if (!domains.includes(emailDomain)) {
      throw new Error("Registration requires a verified institutional email domain.");
    }

    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Account provisioning is not configured.");
    }

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: false,
      user_metadata: { full_name: body.fullName },
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Unable to provision the authentication account.");
    }

    try {
      const container = await getContainer();
      const existing = await container.db.query<{ id: string }>(
        "SELECT id FROM registration_requests WHERE lower(email) = lower($1) AND status IN ('PENDING_VERIFICATION', 'APPROVED', 'PROVISIONED') LIMIT 1;",
        [email]
      );

      if (existing.rows.length > 0) {
        throw new Error("An enrollment request already exists for this email address.");
      }

      const result = await container.db.query<{ id: string; status: string }>(
        `INSERT INTO registration_requests
          (email, full_name, roll_or_prn, department_id, programme, academic_year, requested_role, auth_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, status;`,
        [
          email,
          body.fullName,
          body.rollOrPrn || null,
          body.departmentId || null,
          body.programme || null,
          body.academicYear || null,
          body.requestedRole,
          authData.user.id,
        ]
      );

      return createSuccessResponse(
        { requestId: result.rows[0].id, status: result.rows[0].status },
        { status: 202 }
      );
    } catch (error) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw error;
    }
  } catch (error) {
    return handleApiError(error);
  }
}