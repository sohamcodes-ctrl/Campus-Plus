import { NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/container";
import { createSuccessResponse } from "@/presentation/utils/apiResponse";
import { handleApiError } from "@/presentation/utils/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const container = await getContainer();
    const actor = await container.authAdapter.authenticate(request);

    return createSuccessResponse({
      userId: actor.userId,
      role: actor.role,
      departmentId: actor.departmentId,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
