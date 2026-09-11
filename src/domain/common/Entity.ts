import { ID, ISODateTimeString } from "@/shared/types/common";

export abstract class Entity<TProps> {
  protected readonly _id: ID;
  protected readonly _props: TProps;
  protected readonly _createdAt: ISODateTimeString;
  protected _updatedAt: ISODateTimeString;

  constructor(props: TProps, id: ID, createdAt?: ISODateTimeString, updatedAt?: ISODateTimeString) {
    this._id = id;
    this._props = props;
    const now = new Date().toISOString();
    this._createdAt = createdAt ?? now;
    this._updatedAt = updatedAt ?? now;
  }

  get id(): ID {
    return this._id;
  }

  get createdAt(): ISODateTimeString {
    return this._createdAt;
  }

  get updatedAt(): ISODateTimeString {
    return this._updatedAt;
  }

  public equals(other?: Entity<TProps>): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    return this._id === other._id;
  }
}
