import { graphqlUtils } from '../src/utils/graphql-utils.ts';
import { logger } from '../src/utils/logger.ts';

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

    // Extract query fields
    const schema = response as any;
    const queries = schema.data?.__schema?.queryType?.fields || [];

    logger.info('\n=== Available Queries ===');
    queries.forEach((field: any) => {
      logger.info(`\n${field.name}:`);
      logger.info(`  Description: ${field.description || 'N/A'}`);
      if (field.args?.length > 0) {
        logger.info('  Arguments:');
        field.args.forEach((arg: any) => {
          logger.info(`    - ${arg.name}: ${arg.type.name || arg.type.kind}`);
        });
      }
      logger.info(`  Returns: ${field.type.name || field.type.ofType?.name}`);
    });
  } catch (error) {
    logger.error('Error fetching schema:', error);
  }
}

discoverSchema();
