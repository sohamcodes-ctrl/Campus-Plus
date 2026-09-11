export interface ComplaintFilterQuery {
  complainantId?: string;
  departmentId?: string;
  assignedHandlerId?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export interface ComplaintSummaryView {
  id: string;
  ref_id: string;
  title: string;
  category_id: string;
  category_name?: string;
  department_id: string;
  department_name?: string;
  status: string;
  official_priority: string;
  assigned_handler_id?: string | null;
  created_at: string;
  updated_at: string;
  sla_due_at?: string | null;
}

export interface PaginatedComplaints {
  items: ComplaintSummaryView[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TimelineItemView {
  id: string;
  complaint_id: string;
  actor_id: string | null;
  actor_role: string;
  action_type: string;
  from_status: string | null;
  to_status: string | null;
  remarks: string | null;
  created_at: string;
}

/**
 * Read-Model Query Port for Complaints and Timelines.
 * Decouples paginated list views and audit timelines from aggregate loading.
 */
export interface IComplaintQueryRepository {
  findMany(filters: ComplaintFilterQuery): Promise<PaginatedComplaints>;
  getTimeline(complaintId: string, isStaff: boolean): Promise<TimelineItemView[]>;
}
