import { ID, PaginatedResult, PaginationParams } from "@/shared/types/common";
import { ComplaintStatusType, ComplaintCategoryType } from "@/domain/complaint";

export interface ComplaintFilterParams extends PaginationParams {
  status?: ComplaintStatusType;
  category?: ComplaintCategoryType;
  departmentId?: ID;
  assignedToId?: ID;
  createdById?: ID;
}

export interface ComplaintSummaryDTO {
  id: ID;
  referenceNumber: string;
  title: string;
  category: ComplaintCategoryType;
  status: ComplaintStatusType;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintRepositoryPort {
  findById(id: ID): Promise<ComplaintSummaryDTO | null>;
  findByReferenceNumber(referenceNumber: string): Promise<ComplaintSummaryDTO | null>;
  findMany(filters: ComplaintFilterParams): Promise<PaginatedResult<ComplaintSummaryDTO>>;
  save(complaint: ComplaintSummaryDTO): Promise<void>;
}
