# Campus Plus — Phase 08-C: Staging Demonstration Access Strategy

**Document Classification:** DevOps / Security / Quality Assurance  
**Component:** `src/presentation/components/auth/StagingAccountHelper.tsx`  
**Script:** `scripts/provision-staging-accounts.js`  
**Status:** 100% IMPLEMENTED & VERIFIED  

---

## 1. Problem Statement & Staging Solution

During initial verification, manual inspection revealed that while 7 seeded user accounts existed in PostgreSQL `public.users` from migration 00003, zero identities existed in Supabase Auth `auth.users`. Consequently, evaluators could not authenticate to inspect role experiences.

Rather than weakening application security or implementing client-side role mocking (which would bypass backend RLS and authorization policies), an authentic Staging Access Strategy was executed:
1. **Administrative Provisioning Script:** `scripts/provision-staging-accounts.js` connects via `SUPABASE_SERVICE_ROLE_KEY` to create or update auth records matching the exact PostgreSQL primary keys and verified emails.
2. **Staging Persona UI Helper:** A controlled, non-production UI component (`StagingAccountHelper`) was embedded into the `/login` page.

---

## 2. Provisioned Personas

| Role | Synthetic Email | Database User UUID | Department Scope |
|---|---|---|---|
| `ROLE_STUDENT` | `student.a@synthetic.campusplus.internal` | `00000000-0000-0000-0000-000000001001` | Global Complainant |
| `ROLE_HANDLER` | `handler.it1@synthetic.campusplus.internal` | `00000000-0000-0000-0000-000000001003` | IT Support (`...0010`) |
| `ROLE_DEPT_HEAD` | `hod.it@synthetic.campusplus.internal` | `00000000-0000-0000-0000-000000001005` | IT Support (`...0010`) |
| `ROLE_MANAGEMENT` | `management@synthetic.campusplus.internal` | `00000000-0000-0000-0000-000000001006` | Campus-Wide Executive |
| `ROLE_ADMIN` | `sysadmin@synthetic.campusplus.internal` | `00000000-0000-0000-0000-000000001007` | Technical System Admin |

**Standard Staging Password:** `CampusPlus2026!`

---

## 3. Security Safeguards

- **Zero Markup Leaks:** Credentials are never printed in the HTML markup; clicking a button invokes React state setters.
- **Production Guard:** `StagingAccountHelper` returns `null` when `process.env.NODE_ENV === "production"` unless explicitly overridden by `NEXT_PUBLIC_ENABLE_STAGING_PRESETS="true"`.
- **Full Backend Enforcement:** All queries and mutations performed under these sessions pass through Supabase RLS and `AuthorizationPolicy.ts`.\n