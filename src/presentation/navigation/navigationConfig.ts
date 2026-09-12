"use client";

import { UserRole, UserRoleType } from "@/domain/complaint";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  allowedRoles: UserRoleType[];
  exact?: boolean;
  mobilePriority?: boolean;
}

export const ALL_ROLES: UserRoleType[] = [
  UserRole.ROLE_STUDENT,
  UserRole.ROLE_FACULTY,
  UserRole.ROLE_HANDLER,
  UserRole.ROLE_DEPT_HEAD,
  UserRole.ROLE_ADMIN,
  UserRole.ROLE_MANAGEMENT,
];

export const COMPLAINANT_ROLES: UserRoleType[] = [
  UserRole.ROLE_STUDENT,
  UserRole.ROLE_FACULTY,
];

export const STAFF_ROLES: UserRoleType[] = [
  UserRole.ROLE_HANDLER,
  UserRole.ROLE_DEPT_HEAD,
  UserRole.ROLE_ADMIN,
  UserRole.ROLE_MANAGEMENT,
];

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "nav-dashboard",
    label: "Dashboard",
    href: "/dashboard",
    allowedRoles: ALL_ROLES,
    exact: true,
    mobilePriority: true,
  },
  {
    id: "nav-new-complaint",
    label: "Submit Complaint",
    href: "/complaints/new",
    allowedRoles: COMPLAINANT_ROLES,
    exact: true,
    mobilePriority: true,
  },
  {
    id: "nav-my-complaints",
    label: "My Complaints",
    href: "/complaints",
    allowedRoles: COMPLAINANT_ROLES,
    exact: true,
    mobilePriority: true,
  },
  {
    id: "nav-complaints-dir",
    label: "Complaints Directory",
    href: "/complaints",
    allowedRoles: STAFF_ROLES,
    exact: true,
    mobilePriority: false,
  },
  {
    id: "nav-triage",
    label: "Department Triage",
    href: "/dashboard?tab=triage",
    allowedRoles: [UserRole.ROLE_DEPT_HEAD],
    mobilePriority: true,
  },
  {
    id: "nav-worklist",
    label: "Assigned Worklist",
    href: "/dashboard?tab=worklist",
    allowedRoles: [UserRole.ROLE_HANDLER, UserRole.ROLE_DEPT_HEAD],
    mobilePriority: true,
  },
  {
    id: "nav-escalations",
    label: "Escalation Queue",
    href: "/dashboard?tab=escalations",
    allowedRoles: [UserRole.ROLE_DEPT_HEAD, UserRole.ROLE_ADMIN, UserRole.ROLE_MANAGEMENT],
    mobilePriority: true,
  },
  {
    id: "nav-analytics",
    label: "Institutional Analytics",
    href: "/dashboard?tab=analytics",
    allowedRoles: [UserRole.ROLE_MANAGEMENT, UserRole.ROLE_ADMIN],
    mobilePriority: false,
  },
];

/**
 * Returns navigation items strictly permitted for the authenticated actor's server-confirmed role.
 */
export function getNavigationItemsForRole(role: UserRoleType | null): NavigationItem[] {
  if (!role) return [];
  return NAVIGATION_ITEMS.filter((item) => item.allowedRoles.includes(role));
}

/**
 * Formats a raw role string into clean, institutional display text.
 */
export function formatRoleLabel(role: UserRoleType | string | null): string {
  if (!role) return "Guest";
  switch (role) {
    case UserRole.ROLE_STUDENT:
      return "Student";
    case UserRole.ROLE_FACULTY:
      return "Faculty";
    case UserRole.ROLE_HANDLER:
      return "Complaint Handler";
    case UserRole.ROLE_DEPT_HEAD:
      return "Department Head";
    case UserRole.ROLE_ADMIN:
      return "Administrator";
    case UserRole.ROLE_MANAGEMENT:
      return "Executive Management";
    default:
      return role.replace(/^ROLE_/, "").replace(/_/g, " ");
  }
}
