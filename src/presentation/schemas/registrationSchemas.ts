import { z } from "zod";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REGISTRATION_ROLES = [
  "ROLE_STUDENT",
  "ROLE_HANDLER",
  "ROLE_DEPT_HEAD",
  "ROLE_MANAGEMENT",
  "ROLE_ADMIN",
] as const;
const RegistrationRoleSchema = z.enum(REGISTRATION_ROLES);

export const RegistrationRequestSchema = z.object({
  email: z.string().trim().email().max(255),
  fullName: z.string().trim().min(2).max(150),
  rollOrPrn: z.string().trim().min(1).max(50).optional(),
  departmentId: z.string().regex(UUID_REGEX).optional(),
  programme: z.string().trim().max(150).optional(),
  academicYear: z.number().int().min(1).max(10).optional(),
  requestedRole: RegistrationRoleSchema,
  password: z.string().min(12).max(128),
  acceptedTerms: z.literal(true),
}).strict();

export const RegistrationApprovalSchema = z.object({
  approvedRole: RegistrationRoleSchema,
  approvedDepartmentId: z.string().regex(UUID_REGEX).optional(),
}).strict().superRefine((approval, context) => {
  if (
    (approval.approvedRole === "ROLE_HANDLER" || approval.approvedRole === "ROLE_DEPT_HEAD") &&
    !approval.approvedDepartmentId
  ) {
    context.addIssue({
      code: "custom",
      path: ["approvedDepartmentId"],
      message: "An administrator-approved department is required for staff roles.",
    });
  }
});

export type RegistrationRequest = z.infer<typeof RegistrationRequestSchema>;
