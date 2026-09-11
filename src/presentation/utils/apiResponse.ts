import { NextResponse } from "next/server";

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_records: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiResponseMeta {
  correlation_id: string;
  timestamp: string;
  pagination?: PaginationMeta;
  [key: string]: unknown;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta: ApiResponseMeta;
}

/**
 * Creates a standardized success JSON response adhering to Campus Plus API envelope contracts.
 */
export function createSuccessResponse<T>(
  data: T,
  options?: {
    status?: number;
    correlationId?: string;
    pagination?: PaginationMeta;
    meta?: Record<string, unknown>;
    headers?: Record<string, string>;
  }
): NextResponse<ApiSuccessEnvelope<T>> {
  const status = options?.status ?? 200;
  const correlationId = options?.correlationId ?? crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const meta: ApiResponseMeta = {
    correlation_id: correlationId,
    timestamp,
    ...(options?.pagination ? { pagination: options.pagination } : {}),
    ...(options?.meta ?? {}),
  };

  const responseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "x-correlation-id": correlationId,
    ...(options?.headers ?? {}),
  };

  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    {
      status,
      headers: responseHeaders,
    }
  );
}
