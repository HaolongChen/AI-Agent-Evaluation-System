import * as z from 'zod';

/**
 * GraphQL Query and Mutation Builder
 * Provides elegant type-safe builders for GraphQL operations
 */

/**
 * Serialize a value for GraphQL query string
 */
function serializeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'string') {
    // Check if it's an enum value (ALL_CAPS or PascalCase without spaces)
    // Enums should not be quoted
    if (/^[A-Z_][A-Z0-9_]*$/.test(value)) {
      return value;
    }
    // Regular strings need quotes and escaping
    return `"${value.replace(/"/g, '\\"')}"`;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(serializeValue).join(', ')}]`;
  }

  if (typeof value === 'object') {
    // Serialize object as JSON-like GraphQL input
    const entries = Object.entries(value as Record<string, unknown>);
    const serialized = entries
      .map(([key, val]) => `${key}: ${serializeValue(val)}`)
      .join(', ');
    return `{${serialized}}`;
  }

  return String(value);
}

export class QueryBuilder {
  private operationName: string;
  private queryName: string;
  private fields: string[] = [];
  private variableDefinitions: string[] = [];

  constructor(operationName: string) {
    this.operationName = z.string().nonempty().parse(operationName);
    this.queryName =
      this.operationName.at(0)?.toUpperCase() + this.operationName.slice(1);
  }

  /**
   * Add a variable to the query
   * @example .withVariable('id', '123')
   * @example .withVariable('data', { name: 'John', age: 30 })
   */
  withVariable(name: string, value: unknown): this {
    const serialized = serializeValue(value);
    this.variableDefinitions.push(`${name}: ${serialized}`);
    return this;
  }

  /**
   * Select fields to return
   * @example .select('id', 'name', 'email')
   */
  select(...fields: string[]): this {
    this.fields.push(...fields);
    return this;
  }

  /**
   * Select nested fields with object notation
   * @example .selectNested({ user: ['id', 'name'], posts: ['title'] })
   */
  selectNested(fieldMap: Record<string, string[]>): this {
    Object.entries(fieldMap).forEach(([field, subfields]) => {
      this.fields.push(`${field} { ${subfields.join(' ')} }`);
    });
    return this;
  }

  /**
   * Build the query string
   */
  build(): string {
    const variablePart =
      this.variableDefinitions.length > 0
        ? `(${this.variableDefinitions.join(', ')})`
        : '';

    const fieldsPart = this.fields.join('\n');

    const query = `
      query ${this.queryName} {
        ${this.operationName} ${variablePart} {
          ${fieldsPart}
        }
      }
    `.trim();

    return query;
  }
}

export class MutationBuilder {
  // TODO: modify mutation part to correspond to query part
  private operationName: string;
  private mutationName: string;
  private fields: string[] = [];
  private variableDefinitions: string[] = [];

  constructor(operationName: string) {
    this.operationName = z.string().nonempty().parse(operationName);
    this.mutationName =
      this.operationName.at(0)?.toUpperCase() + this.operationName.slice(1);
  }

  /**
   * Add a variable and its argument mapping
   * @example .withVariable('id', '123')
   * @example .withVariable('data', { name: 'John', age: 30 })
   */
  withVariable(name: string, value: unknown): this {
    const serialized = serializeValue(value);
    this.variableDefinitions.push(`${name}: ${serialized}`);
    return this;
  }

  /**
   * Select fields to return from the mutation
   */
  select(...fields: string[]): this {
    this.fields.push(...fields);
    return this;
  }

  /**
   * Select nested fields
   */
  selectNested(fieldMap: Record<string, string[]>): this {
    Object.entries(fieldMap).forEach(([field, subfields]) => {
      this.fields.push(`${field} { ${subfields.join(' ')} }`);
    });
    return this;
  }

  /**
   * Build the mutation string
   */
  build(): string {
    const variablePart =
      this.variableDefinitions.length > 0
        ? `(${this.variableDefinitions.join(', ')})`
        : '';

    const fieldsPart = this.fields.join('\n');

    const query = `
      mutation ${this.mutationName} {
        ${this.operationName} ${variablePart} {
          ${fieldsPart}
        }
      }
    `.trim();

    return query;
  }
}

/**
 * Convenient factory functions
 */
export const query = (name: string) => new QueryBuilder(name);
export const mutation = (name: string) => new MutationBuilder(name);

/**
 * Pre-built operations for common use cases
 */
export const GoldenSetQueries = {
  getSchemas: (copilotType?: string) => {
    const builder = query('getGoldenSetSchemas');
    if (copilotType) {
      builder.withVariable('copilotType', copilotType);
    }
    return builder.build();
  },

  getGoldenSets: (projectExId?: string, copilotType?: string) => {
    const builder = query('getGoldenSets').select(
      'id',
      'projectExId',
      'schemaExId',
      'copilotType',
      'description',
      'query',
      'createdAt',
      'isActive'
    );

    if (projectExId) {
      builder.withVariable('projectExId', projectExId);
    }
    if (copilotType) {
      builder.withVariable('copilotType', copilotType);
    }

    return builder.build();
  },
};


