/**
 * Base repository interface
 * 
 * Defines common CRUD operations for all repositories
 */

export interface IRepository<T, ID = number> {
  /**
   * Find entity by ID
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Find all entities matching criteria
   */
  findMany(criteria?: Partial<T>): Promise<T[]>;

  /**
   * Create a new entity
   */
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;

  /**
   * Update an existing entity
   */
  update(id: ID, data: Partial<T>): Promise<T>;

  /**
   * Delete an entity
   */
  delete(id: ID): Promise<void>;

  /**
   * Check if entity exists
   */
  exists(id: ID): Promise<boolean>;
}
