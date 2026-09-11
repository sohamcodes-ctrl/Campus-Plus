# Server-Side Authentication & ActorContext

## 1. Authentication Architecture

Campus Plus uses a server-side authentication pattern encapsulated in `src/infrastructure/auth/AuthenticationAdapter.ts`.

Authentication does not merely extract a user ID from a token; it resolves a fully verified 4-dimensional **`ActorContext`**:

```typescript
export interface ActorContext {
  readonly userId: string;
  readonly role: UserRoleType;
  readonly departmentId?: string; // Present for staff members assigned to a department
}
```

## 2. Zero-Trust Role & Membership Resolution

Client requests are never allowed to assert their own role, privileges, or department scope in query parameters or request headers.
The `AuthenticationAdapter`:

1. Extracts the token from the `Authorization: Bearer <token>` header.
2. Queries the authoritative database tables:
   ```sql
   SELECT u.id, u.email, u.full_name, u.is_active, r.id as role_id, dm.department_id
   FROM users u
   LEFT JOIN user_roles ur ON u.id = ur.user_id
   LEFT JOIN roles r ON ur.role_id = r.id
   LEFT JOIN department_memberships dm ON u.id = dm.user_id AND dm.is_active = TRUE
   WHERE u.id = $1 LIMIT 1;
   ```
3. Checks `is_active` flag. Inactive or suspended accounts are rejected immediately with `401 Unauthorized`.
4. Attaches verified role (`ROLE_STUDENT`, `ROLE_HANDLER`, `ROLE_DEPT_HEAD`, `ROLE_MANAGEMENT`, `ROLE_ADMIN`) and active `departmentId`.

## 3. Production Security Gate

In test environments, `x-actor-id` can be used to simulate different actors without spinning up complex OAuth flows.
However, this is protected by a strict runtime gate:

```typescript
const isProduction = process.env.NODE_ENV === "production";
const testActorHeader = request.headers.get("x-actor-id");

if (!isProduction && testActorHeader) {
  resolvedUserId = testActorHeader.trim();
} else {
  // Production requires standard cryptographic Bearer token
}
```

In production, any `x-actor-id` header is silently ignored.
