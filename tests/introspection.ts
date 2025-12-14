import { graphqlUtils } from '../src/utils/graphql-utils.ts';
import { logger } from '../src/utils/logger.ts';
import type {
  IntrospectionField,
  IntrospectionInputValue,
  IntrospectionQuery,
  IntrospectionTypeRef,
} from 'graphql';

// GraphQL introspection query to discover available queries and types
const introspectionQuery = `
  query IntrospectionQuery {
    __schema {
      queryType {
        name
        fields {
          name
          description
          args {
            name
            type {
              name
              kind
            }
          }
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
      types {
        name
        kind
        description
        fields {
          name
          description
        }
      }
    }
  }
`;

async function discoverSchema() {
  try {
    logger.info('Fetching GraphQL schema...');
    const response = await graphqlUtils.accessEndpointWithQuery(
      introspectionQuery,
      true
    );

    logger.info('GraphQL Schema:', JSON.stringify(response, null, 2));

    type IntrospectionResponse = {
      data?: IntrospectionQuery;
      errors?: unknown;
    };

    // Extract query fields
    const schema = response as IntrospectionResponse;
    const queryType = schema.data?.__schema?.queryType;
    const queries: IntrospectionField[] =
      queryType && 'fields' in queryType
        ? (queryType.fields as IntrospectionField[])
        : [];

    logger.info('\n=== Available Queries ===');
    queries.forEach((field: IntrospectionField) => {
      logger.info(`\n${field.name}:`);
      logger.info(`  Description: ${field.description || 'N/A'}`);
      if (field.args?.length > 0) {
        logger.info('  Arguments:');
        field.args.forEach((arg: IntrospectionInputValue) => {
          logger.info(`    - ${arg.name}: ${describeType(arg.type)}`);
        });
      }
      logger.info(`  Returns: ${describeType(field.type)}`);
    });
  } catch (error) {
    logger.error('Error fetching schema:', error);
  }
}

function describeType(
  typeRef: IntrospectionTypeRef | null | undefined
): string {
  if (!typeRef) {
    return 'Unknown';
  }

  // Handle different type variants
  if ('ofType' in typeRef && typeRef.ofType) {
    const current =
      'name' in typeRef && typeRef.name
        ? typeRef.name
        : typeRef.kind || 'Unknown';
    return `${current}<${describeType(typeRef.ofType)}>`;
  }

  // For named types
  if ('name' in typeRef && typeRef.name) {
    return typeRef.name;
  }

  // Fallback to kind if available
  if ('kind' in typeRef && typeRef.kind) {
    return typeRef.kind;
  }

  return 'Unknown';
}

discoverSchema();
