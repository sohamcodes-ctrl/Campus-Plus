/**
 * Functional Result Pattern implementation for Domain and Application boundaries.
 */

export type Result<T, E = Error> =
  | { readonly isSuccess: true; readonly isFailure: false; readonly value: T }
  | { readonly isSuccess: false; readonly isFailure: true; readonly error: E };

export const ok = <T, E = Error>(value: T): Result<T, E> => ({
  isSuccess: true,
  isFailure: false,
  value,
});

export const err = <T, E = Error>(error: E): Result<T, E> => ({
  isSuccess: false,
  isFailure: true,
  error,
});
