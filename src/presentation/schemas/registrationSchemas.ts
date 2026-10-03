import { z } from "zod";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const RegistrationRequestSchema = z.object({
  email: z.string().trim().email().max(255),
  fullName: z.string().trim().min(2).max(150),
  rollOrPrn: z.string().trim().min(1).max(50).optional(),
  departmentId: z.string().regex(UUID_REGEX).optional(),
  programme: z.string().trim().max(150).optional(),
  academicYear: z.number().int().min(1).max(10).optional(),
  requestedRole: z.enum([
    "ROLE_STUDENT",
    "ROLE_HANDLER",
    "ROLE_DEPT_HEAD",
    "ROLE_MANAGEMENT",
    "ROLE_ADMIN",
  ]),
  password: z.string().min(12).max(128),
  acceptedTerms: z.literal(true),
}).strict();

export type RegistrationRequest = z.infer<typeof RegistrationRequestSchema>;