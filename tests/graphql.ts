import { QueryBuilder } from '../src/utils/graphql-builder.ts';
import { graphqlUtils } from '../src/utils/graphql-utils.ts';
import { logger } from '../src/utils/logger.ts';

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', reason);
  logger.error('Promise:', promise);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

const operationName = 'getGoldenSets';

const query = new QueryBuilder(operationName)
  .withVariable('copilotType', 'DATA_MODEL_BUILDER')
  .select(
    'id',
    'projectExId',
    'copilotType',
    'description',
    'query',
    'createdAt',
    'isActive'
  )
  .build();

async function main(): Promise<void> {
  let exitCode = 0;
  try {
    const response = await graphqlUtils.accessEndpointWithQuery(query);
    logger.info('GraphQL Response:', response);
  } catch (error) {
    logger.error('GraphQL Error:', error);
    exitCode = 1;
  }
  process.exit(exitCode);
}

main();
