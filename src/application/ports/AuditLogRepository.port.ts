import { ID } from "@/shared/types/common";

export interface AuditLogEntryDTO {
  id: ID;
  entityType: string;
  entityId: ID;
  action: string;
  actorId: ID;
  actorRole: string;
  ipAddress?: string;
  userAgent?: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface AuditLogRepositoryPort {
  append(entry: Omit<AuditLogEntryDTO, "id" | "timestamp">): Promise<void>;
  findByEntity(entityType: string, entityId: ID): Promise<AuditLogEntryDTO[]>;
}
