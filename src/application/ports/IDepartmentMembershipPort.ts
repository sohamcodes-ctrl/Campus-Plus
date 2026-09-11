/**
 * Department Membership Verification Port (INV-007 / BR-009).
 * Verifies whether a user actively belongs to a specified department for jurisdictional scoping.
 */
export interface IDepartmentMembershipPort {
  isUserInDepartment(userId: string, departmentId: string): Promise<boolean>;
  isDepartmentActive(departmentId: string): Promise<boolean>;
}
