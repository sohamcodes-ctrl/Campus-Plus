import { UserRole, UserRoleType } from "@/domain/complaint";

export type PersonaId = "student" | "handler" | "hod" | "director" | "management";

export interface PersonaConfig {
  id: PersonaId;
  label: string;
  badgeLabel: string;
  shortDescription: string;
  detailedDescription: string;
  technicalRole: UserRoleType;
  allowedTechnicalRoles: UserRoleType[];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    text: string;
    actionText: string;
  };
}

export type RegistrationState =
  | "IDLE"
  | "VALIDATING"
  | "SUBMITTING"
  | "SUCCESS"
  | "PENDING_VERIFICATION"
  | "AUTHENTICATION_REQUIRED"
  | "VALIDATION_ERROR"
  | "EMAIL_ALREADY_REGISTERED"
  | "ROLE_NOT_ELIGIBLE"
  | "INSTITUTIONAL_VERIFICATION_REQUIRED"
  | "SERVER_ERROR"
  | "NETWORK_ERROR";

export const PERSONA_CONFIGS: Record<PersonaId, PersonaConfig> = {
  student: {
    id: "student",
    label: "Student",
    badgeLabel: "Complainant",
    shortDescription: "Raise and track campus complaints, verify resolutions, and stay informed.",
    detailedDescription: "Access student grievance intake, live resolution tracking, and resolution verification sign-off.",
    technicalRole: UserRole.ROLE_STUDENT,
    allowedTechnicalRoles: [UserRole.ROLE_STUDENT, UserRole.ROLE_FACULTY],
    palette: {
      primary: "#7FA8D9",
      secondary: "#B8D0EC",
      accent: "#EAF2FB",
      surface: "#FAFCFE",
      text: "#33475B",
      actionText: "#1E3A5F",
    },
  },
  handler: {
    id: "handler",
    label: "Faculty / Complaint Handler",
    badgeLabel: "Staff Handler",
    shortDescription: "Review, manage, assign, and resolve complaints within your authorized institutional responsibilities.",
    detailedDescription: "Operational workspace for assigned faculty and department staff to manage tasks, execute resolutions, and forward misrouted grievances.",
    technicalRole: UserRole.ROLE_HANDLER,
    allowedTechnicalRoles: [UserRole.ROLE_HANDLER, UserRole.ROLE_FACULTY],
    palette: {
      primary: "#7FC4B2",
      secondary: "#B7E0D3",
      accent: "#E9F6F1",
      surface: "#FAFDFC",
      text: "#2E4A42",
      actionText: "#1A3830",
    },
  },
  hod: {
    id: "hod",
    label: "HOD",
    badgeLabel: "Department Head",
    shortDescription: "Oversee department grievances, escalations, accountability, and resolution.",
    detailedDescription: "Departmental governance portal to review incoming complaints, assign handlers, monitor SLAs, and handle Tier 2 escalations.",
    technicalRole: UserRole.ROLE_DEPT_HEAD,
    allowedTechnicalRoles: [UserRole.ROLE_DEPT_HEAD],
    palette: {
      primary: "#B39DDB",
      secondary: "#D6C6EC",
      accent: "#F3EDFA",
      surface: "#FCFAFE",
      text: "#43395A",
      actionText: "#2B1E40",
    },
  },
  director: {
    id: "director",
    label: "Director / Senior Authority",
    badgeLabel: "Directorate",
    shortDescription: "Provide senior institutional oversight for escalated grievances and accountability.",
    detailedDescription: "Executive administration workspace providing cross-departmental supervision, audit ledger review, and institutional health monitoring.",
    technicalRole: UserRole.ROLE_ADMIN,
    allowedTechnicalRoles: [UserRole.ROLE_ADMIN],
    palette: {
      primary: "#9FB4C7",
      secondary: "#C7D5E0",
      accent: "#EEF3F7",
      surface: "#FBFCFD",
      text: "#37495A",
      actionText: "#223344",
    },
  },
  management: {
    id: "management",
    label: "Institutional Management",
    badgeLabel: "Governing Body",
    shortDescription: "Monitor institutional grievance governance, patterns, accountability, and campus-level improvement.",
    detailedDescription: "Strategic institutional intelligence for college leadership, tracking complaint volume trends, department SLAs, and resolving Tier 3 deadlocks.",
    technicalRole: UserRole.ROLE_MANAGEMENT,
    allowedTechnicalRoles: [UserRole.ROLE_MANAGEMENT],
    palette: {
      primary: "#E3A6AE",
      secondary: "#F0C9CE",
      accent: "#FBEDEF",
      surface: "#FEFAFA",
      text: "#5C333A",
      actionText: "#3D1C22",
    },
  },
};

export const ALL_PERSONA_IDS: PersonaId[] = [
  "student",
  "handler",
  "hod",
  "director",
  "management",
];

export function getPersonaFromRole(role: UserRoleType | null | undefined): PersonaId {
  if (!role) return "student";
  switch (role) {
    case UserRole.ROLE_STUDENT:
      return "student";
    case UserRole.ROLE_FACULTY:
      return "student"; // Default to student complainant view; can also access handler
    case UserRole.ROLE_HANDLER:
      return "handler";
    case UserRole.ROLE_DEPT_HEAD:
      return "hod";
    case UserRole.ROLE_ADMIN:
      return "director";
    case UserRole.ROLE_MANAGEMENT:
      return "management";
    default:
      return "student";
  }
}
