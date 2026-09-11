import { ID, ISODateTimeString } from "@/shared/types/common";

export interface DomainEvent<TPayload = unknown> {
  readonly eventId: ID;
  readonly aggregateId: ID;
  readonly eventType: string;
  readonly occurredAt: ISODateTimeString;
  readonly payload: TPayload;
}
