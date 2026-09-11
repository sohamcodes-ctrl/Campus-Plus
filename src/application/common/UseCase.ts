/**
 * Application Use Case Interface
 * Defines the contract for all application commands and queries.
 */
export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}
