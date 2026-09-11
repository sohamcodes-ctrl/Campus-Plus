import { describe, it, expect } from "vitest";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  InvalidStateTransitionError,
  InternalServerError,
} from "@/shared/errors/AppError";
import { ErrorCodes } from "@/shared/errors/ErrorCodes";

describe("Error Taxonomy & Subclasses", () => {
  it("should create a ValidationError with status 400 and code VALIDATION_FAILED", () => {
    const error = new ValidationError("Title is required", { field: "title" }, "corr-123");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe(ErrorCodes.VALIDATION_FAILED);
    expect(error.message).toBe("Title is required");
    expect(error.correlationId).toBe("corr-123");
    expect(error.details).toEqual({ field: "title" });
  });

  it("should create an AuthenticationError with status 401", () => {
    const error = new AuthenticationError();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe(ErrorCodes.UNAUTHENTICATED);
  });

  it("should create an AuthorizationError with status 403", () => {
    const error = new AuthorizationError("Access denied to department queue");
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe(ErrorCodes.FORBIDDEN);
  });

  it("should create a NotFoundError with status 404", () => {
    const error = new NotFoundError("Complaint", "cmp_123");
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe(ErrorCodes.NOT_FOUND);
    expect(error.message).toContain("Complaint with id 'cmp_123' was not found");
  });

  it("should create a ConflictError with status 409", () => {
    const error = new ConflictError("Complaint has already been closed");
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe(ErrorCodes.CONFLICT);
  });

  it("should create an InvalidStateTransitionError with status 422", () => {
    const error = new InvalidStateTransitionError("DRAFT", "RESOLVED", "Cannot resolve unverified draft");
    expect(error.statusCode).toBe(422);
    expect(error.code).toBe(ErrorCodes.STATE_TRANSITION_INVALID);
    expect(error.message).toContain("Invalid state transition from 'DRAFT' to 'RESOLVED'");
  });

  it("should create an InternalServerError with status 500", () => {
    const error = new InternalServerError("Database connection dropped", { db: "primary" }, "corr-500");
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe(ErrorCodes.INTERNAL_ERROR);
    expect(error.isOperational).toBe(false);
    expect(error.correlationId).toBe("corr-500");
  });

  it("should serialize properly via toJSON without exposing internal state", () => {
    const error = new AppError({
      message: "Something failed",
      code: ErrorCodes.INTERNAL_ERROR,
      statusCode: 500,
      correlationId: "corr-999",
      details: { component: "test" },
    });

    const json = error.toJSON();
    expect(json.name).toBe("AppError");
    expect(json.message).toBe("Something failed");
    expect(json.code).toBe(ErrorCodes.INTERNAL_ERROR);
    expect(json.statusCode).toBe(500);
    expect(json.correlationId).toBe("corr-999");
    expect(json.details).toEqual({ component: "test" });
    expect(json.timestamp).toBeDefined();
  });
});
