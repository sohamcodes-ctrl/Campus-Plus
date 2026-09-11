import { NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/container";
import { toComplaintDTO } from "@/presentation/dtos/complaintDTOs";
import { createSuccessResponse } from "@/presentation/utils/apiResponse";
import { handleApiError } from "@/presentation/utils/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const container = await getContainer();
    const actor = await container.authAdapter.authenticate(request);

    const result = await container.getComplaintUseCase.execute({
      idOrTrackingCode: id,
      actor,
    });

    if (result.isFailure) {
      return handleApiError(result.error);
    }

    const dto = toComplaintDTO(result.value, actor);
    return createSuccessResponse(dto);
  } catch (error) {
    return handleApiError(error);
  }
}
