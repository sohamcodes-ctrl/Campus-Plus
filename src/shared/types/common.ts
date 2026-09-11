/**
 * Common shared utility types for Campus Plus
 */

export type ID = string;
export type ISODateTimeString = string;

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export type SortOrder = "asc" | "desc";

export interface SortOptions {
  field: string;
  order: SortOrder;
}

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
