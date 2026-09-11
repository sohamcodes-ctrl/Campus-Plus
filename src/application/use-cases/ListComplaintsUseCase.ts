import { UseCase } from "../common/UseCase";
import {
  IComplaintQueryRepository,
  PaginatedComplaints,
  ComplaintFilterQuery,
} from "../ports/IComplaintQueryRepository";
import { ActorContext, UserRole } from "@/domain/complaint";
import { Result, ok } from "@/domain/common/Result";
import { AppError } from "@/shared/errors/AppError";

export interface ListComplaintsQuery {
  actor: ActorContext;
  status?: string;
  priority?: string;
  departmentId?: string;
  assignedHandlerId?: string;
  page?: number;
  limit?: number;
}

/**
 * List Complaints Query Use Case.
 * Enforces strict role-based data scoping:
 * - Students/Faculty see only their own complaints (complainant_id = actor.userId).
 * - Handlers and Department Heads see only complaints within their own department.
 * - Management and Admins have institutional purview across all departments.
 */
export class ListComplaintsUseCase implements UseCase<ListComplaintsQuery, Result<PaginatedComplaints, AppError>> {
  constructor(private readonly queryRepo: IComplaintQueryRepository) {}

  public async execute(query: ListComplaintsQuery): Promise<Result<PaginatedComplaints, AppError>> {
    const { actor } = query;
    const filter: ComplaintFilterQuery = {
      status: query.status,
      priority: query.priority,
      page: query.page,
      limit: query.limit,
    };

    // 1. Role Scoping Rules
    if (actor.role === UserRole.ROLE_STUDENT || actor.role === UserRole.ROLE_FACULTY) {
      // Students MUST ONLY see their own tickets; any client query parameter for other departments/users is ignored
      filter.complainantId = actor.userId;
    } else if (actor.role === UserRole.ROLE_HANDLER || actor.role === UserRole.ROLE_DEPT_HEAD) {
      // Staff members MUST operate strictly within their assigned department scope
      filter.departmentId = actor.departmentId;
      if (actor.role === UserRole.ROLE_HANDLER && query.assignedHandlerId) {
        filter.assignedHandlerId = query.assignedHandlerId;
      }
    } else if (actor.role === UserRole.ROLE_ADMIN || actor.role === UserRole.ROLE_MANAGEMENT) {
      // Institutional purview allows filtering by department if requested
      if (query.departmentId) {
        filter.departmentId = query.departmentId;
      }
    }

    const result = await this.queryRepo.findMany(filter);
    return ok(result);
  }
}
