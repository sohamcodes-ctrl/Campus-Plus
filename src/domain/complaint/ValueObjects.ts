import { ValueObject } from "@/domain/common/ValueObject";
import { InvalidValueObjectError } from "./DomainErrors";
import { ComplaintPriority, ComplaintPriorityType } from "./ComplaintTypes";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TRACKING_CODE_REGEX = /^CP-\d{4}-\d{5}$/;

export class ComplaintId extends ValueObject<string> {
  constructor(id: string) {
    if (!id || !UUID_REGEX.test(id)) {
      throw new InvalidValueObjectError("ComplaintId", `Must be a valid UUID v4 format. Received: '${id}'`);
    }
    super(id.toLowerCase());
  }

  public toString(): string {
    return this.props;
  }
}

export class TrackingCode extends ValueObject<string> {
  constructor(code: string) {
    if (!code || !TRACKING_CODE_REGEX.test(code)) {
      throw new InvalidValueObjectError("TrackingCode", `Must match format CP-YYYY-XXXXX. Received: '${code}'`);
    }
    super(code.toUpperCase());
  }

  public toString(): string {
    return this.props;
  }
}

export class UserId extends ValueObject<string> {
  constructor(id: string) {
    if (!id || !UUID_REGEX.test(id)) {
      throw new InvalidValueObjectError("UserId", `Must be a valid UUID. Received: '${id}'`);
    }
    super(id.toLowerCase());
  }

  public toString(): string {
    return this.props;
  }
}

export class DepartmentId extends ValueObject<string> {
  constructor(id: string) {
    if (!id || !UUID_REGEX.test(id)) {
      throw new InvalidValueObjectError("DepartmentId", `Must be a valid UUID. Received: '${id}'`);
    }
    super(id.toLowerCase());
  }

  public toString(): string {
    return this.props;
  }
}

export class CategoryId extends ValueObject<string> {
  constructor(id: string) {
    if (!id || !UUID_REGEX.test(id)) {
      throw new InvalidValueObjectError("CategoryId", `Must be a valid UUID. Received: '${id}'`);
    }
    super(id.toLowerCase());
  }

  public toString(): string {
    return this.props;
  }
}

export class LocationId extends ValueObject<string> {
  constructor(id: string) {
    if (!id || !UUID_REGEX.test(id)) {
      throw new InvalidValueObjectError("LocationId", `Must be a valid UUID. Received: '${id}'`);
    }
    super(id.toLowerCase());
  }

  public toString(): string {
    return this.props;
  }
}

export class ComplaintTitle extends ValueObject<string> {
  constructor(title: string) {
    const trimmed = title?.trim() ?? "";
    if (trimmed.length < 10 || trimmed.length > 120) {
      throw new InvalidValueObjectError(
        "ComplaintTitle",
        `Title must be between 10 and 120 characters (chk_complaint_title_len). Received ${trimmed.length} characters.`
      );
    }
    super(trimmed);
  }

  public toString(): string {
    return this.props;
  }
}

export class ComplaintDescription extends ValueObject<string> {
  constructor(description: string) {
    const trimmed = description?.trim() ?? "";
    if (trimmed.length < 30) {
      throw new InvalidValueObjectError(
        "ComplaintDescription",
        `Description must be at least 30 characters (chk_complaint_desc_len). Received ${trimmed.length} characters.`
      );
    }
    super(trimmed);
  }

  public toString(): string {
    return this.props;
  }
}

export class Priority extends ValueObject<ComplaintPriorityType> {
  constructor(priority: string) {
    if (!Object.values(ComplaintPriority).includes(priority as ComplaintPriorityType)) {
      throw new InvalidValueObjectError(
        "Priority",
        `Priority must be one of LOW, MEDIUM, HIGH, URGENT. Received: '${priority}'`
      );
    }
    super(priority as ComplaintPriorityType);
  }

  public toString(): string {
    return this.props;
  }
}

export class ResolutionSummary extends ValueObject<string> {
  constructor(summary: string) {
    const trimmed = summary?.trim() ?? "";
    if (trimmed.length < 20) {
      throw new InvalidValueObjectError(
        "ResolutionSummary",
        `Resolution summary must be at least 20 characters (BR-015, chk_resolution_summary_len). Received ${trimmed.length} characters.`
      );
    }
    super(trimmed);
  }

  public toString(): string {
    return this.props;
  }
}

export class ForwardingRationale extends ValueObject<string> {
  constructor(rationale: string) {
    const trimmed = rationale?.trim() ?? "";
    if (trimmed.length < 10) {
      throw new InvalidValueObjectError(
        "ForwardingRationale",
        `Forwarding rationale must be at least 10 characters (BR-010, chk_forward_rationale_len). Received ${trimmed.length} characters.`
      );
    }
    super(trimmed);
  }

  public toString(): string {
    return this.props;
  }
}

export class ComplaintVersion extends ValueObject<number> {
  constructor(version: number) {
    if (!Number.isInteger(version) || version < 1) {
      throw new InvalidValueObjectError(
        "ComplaintVersion",
        `Version must be an integer >= 1 (chk_complaint_version). Received: ${version}`
      );
    }
    super(version);
  }

  public next(): ComplaintVersion {
    return new ComplaintVersion(this.props + 1);
  }

  public toNumber(): number {
    return this.props;
  }
}
