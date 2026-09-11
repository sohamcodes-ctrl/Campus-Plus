import { IDepartmentMembershipPort } from "@/application/ports/IDepartmentMembershipPort";
import { DatabaseQueryInterface } from "../database/migrator";

/**
 * Department Membership Verification Adapter.
 * Verifies active jurisdictional membership and active department status against PostgreSQL.
 */
export class PostgresDepartmentMembershipAdapter implements IDepartmentMembershipPort {
  constructor(private readonly db: DatabaseQueryInterface) {}

  public async isUserInDepartment(userId: string, departmentId: string): Promise<boolean> {
    const res = await this.db.query(
      "SELECT 1 FROM department_memberships WHERE user_id = $1 AND department_id = $2 AND is_active = TRUE LIMIT 1;",
      [userId, departmentId]
    );
    return res.rows.length > 0;
  }

  public async isDepartmentActive(departmentId: string): Promise<boolean> {
    const res = await this.db.query(
      "SELECT 1 FROM departments WHERE id = $1 AND is_active = TRUE LIMIT 1;",
      [departmentId]
    );
    return res.rows.length > 0;
  }
}
