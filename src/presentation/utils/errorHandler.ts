import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/shared/errors/AppError";
import { ErrorCodes } from "@/shared/errors/ErrorCodes";

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    correlation_id: string;
    details?: unknown;
  };
}

/**
 * Maps any caught exception or Result error into a deterministic HTTP error response.
 */
export function handleApiError(
  error: unknown,
  correlationId?: string
): NextResponse<ApiErrorEnvelope> {
  const finalCorrelationId = correlationId ?? crypto.randomUUID();

  // 1. Zod Validation Errors
  if (error instanceof ZodError) {
    const formattedIssues = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));

    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Request payload validation failed",
          correlation_id: finalCorrelationId,
          details: formattedIssues,
        },
      },
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "x-correlation-id": finalCorrelationId,
        },
      }
    );
  }

  // 2. AppError / DomainError / Operational Errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          correlation_id: finalCorrelationId,
          details: error.details,
        },
      },
      {
        status: error.statusCode,
        headers: {
          "Content-Type": "application/json",
          "x-correlation-id": finalCorrelationId,
        },
      }
    );
  }

  // 3. Fallback / Unhandled 500
  const isDevOrTest = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
  const errorMessage = isDevOrTest && error instanceof Error ? error.message : "An unexpected internal server error occurred";

  return NextResponse.json(
    {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: errorMessage,
        correlation_id: finalCorrelationId,
        details: isDevOrTest && error instanceof Error ? { stack: error.stack } : undefined,
      },
    },
    {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "x-correlation-id": finalCorrelationId,
      },
    }
  );
}
