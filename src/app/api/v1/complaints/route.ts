import { NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/container";
import { SubmitComplaintSchema } from "@/presentation/schemas/complaintSchemas";
import { createSuccessResponse } from "@/presentation/utils/apiResponse";
import { handleApiError } from "@/presentation/utils/errorHandler";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const container = await getContainer();
    const actor = await container.authAdapter.authenticate(request);

    const idempotencyKey =
      request.headers.get("idempotency-key") ||
      request.headers.get("x-idempotency-key") ||
      undefined;

    const body = await request.json();
    const validated = SubmitComplaintSchema.parse(body);

    const result = await container.submitComplaintUseCase.execute({
      complainantId: actor.userId,
      departmentId: validated.departmentId,
      categoryId: validated.categoryId,
      title: validated.title,
      description: validated.description,
      locationDetails: validated.locationDetails,
      locationId: validated.locationId,
      suggestedPriority: validated.suggestedPriority,
      attachments: validated.attachments,
      idempotencyKey,
    });

    if (result.isFailure) {
      return handleApiError(result.error);
    }

    return createSuccessResponse(result.value, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const container = await getContainer();
    const actor = await container.authAdapter.authenticate(request);

    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const departmentId = searchParams.get("department_id") || undefined;

    const result = await container.listComplaintsUseCase.execute({
      actor,
      departmentId,
      status,
      priority,
      page,
      limit,
    });

    if (result.isFailure) {
      return handleApiError(result.error);
    }

    const paginated = result.value;
    return createSuccessResponse(paginated.items, {
      pagination: {
        page: paginated.page,
        page_size: paginated.limit,
        total_records: paginated.total,
        total_pages: paginated.totalPages,
        has_next: paginated.page < paginated.totalPages,
        has_prev: paginated.page > 1,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
