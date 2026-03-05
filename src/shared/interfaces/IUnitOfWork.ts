/**
 * Unit of Work interface
 * 
 * Manages database transactions across multiple repositories
 */

export interface IUnitOfWork {
  /**
   * Begin a new transaction
   */
  begin(): Promise<void>;

  /**
   * Commit the current transaction
   */
  commit(): Promise<void>;

  /**
   * Rollback the current transaction
   */
  rollback(): Promise<void>;

  /**
   * Execute a function within a transaction
   * Automatically commits on success, rolls back on error
   */
  transaction<T>(work: () => Promise<T>): Promise<T>;

  /**
   * Check if a transaction is active
   */
  isActive(): boolean;
}
