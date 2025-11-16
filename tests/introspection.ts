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
    const queries = schema.data?.__schema?.queryType?.fields ?? [];

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

function describeType(typeRef: IntrospectionTypeRef | null | undefined): string {
  if (!typeRef) {
    return 'Unknown';
  }

  if ('ofType' in typeRef && typeRef.ofType) {
    const current = typeRef.name ?? typeRef.kind;
    return `${current}<${describeType(typeRef.ofType)}>`;
  }

  return typeRef.name ?? typeRef.kind;
}

discoverSchema();
