import { ErrorCode, ErrorCodes } from "./ErrorCodes";

export interface ErrorDetails {
  [key: string]: unknown;
}

export interface SerializedError {
  name: string;
  message: string;
  code: ErrorCode;
  statusCode: number;
  correlationId?: string;
  details?: ErrorDetails;
  timestamp: string;
}

/**
 * Base Application Error
 * All domain and application errors should derive from this class.
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly correlationId?: string;
  public readonly details?: ErrorDetails;
  public readonly timestamp: string;

  constructor(params: {
    message: string;
    code: ErrorCode;
    statusCode: number;
    isOperational?: boolean;
    correlationId?: string;
    details?: ErrorDetails;
  }) {
    super(params.message);
    this.name = this.constructor.name;
    this.code = params.code;
    this.statusCode = params.statusCode;
    this.isOperational = params.isOperational ?? true;
    this.correlationId = params.correlationId;
    this.details = params.details;
    this.timestamp = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON(): SerializedError {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      correlationId: this.correlationId,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: ErrorDetails, correlationId?: string) {
    super({
      message,
      code: ErrorCodes.VALIDATION_FAILED,
      statusCode: 400,
      details,
      correlationId,
    });
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required", correlationId?: string) {
    super({
      message,
      code: ErrorCodes.UNAUTHENTICATED,
      statusCode: 401,
      correlationId,
    });
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Permission denied", correlationId?: string) {
    super({
      message,
      code: ErrorCodes.FORBIDDEN,
      statusCode: 403,
      correlationId,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string, correlationId?: string) {
    super({
      message: id ? `${resource} with id '${id}' was not found` : `${resource} was not found`,
      code: ErrorCodes.NOT_FOUND,
      statusCode: 404,
      details: id ? { resource, id } : { resource },
      correlationId,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: ErrorDetails, correlationId?: string) {
    super({
      message,
      code: ErrorCodes.CONFLICT,
      statusCode: 409,
      details,
      correlationId,
    });
  }
}

export class InvalidStateTransitionError extends AppError {
  constructor(
    currentState: string,
    targetState: string,
    reason?: string,
    correlationId?: string
  ) {
    const msg = `Invalid state transition from '${currentState}' to '${targetState}'${reason ? `: ${reason}` : ""}`;
    super({
      message: msg,
      code: ErrorCodes.STATE_TRANSITION_INVALID,
      statusCode: 422,
      details: { currentState, targetState, reason },
      correlationId,
    });
  }
}

export class InternalServerError extends AppError {
  constructor(message = "An unexpected error occurred", details?: ErrorDetails, correlationId?: string) {
    super({
      message,
      code: ErrorCodes.INTERNAL_ERROR,
      statusCode: 500,
      isOperational: false,
      details,
      correlationId,
    });
  }
}
