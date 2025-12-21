import { QueryBuilder } from '../src/utils/graphql-builder.ts';
import { graphqlUtils } from '../src/utils/graphql-utils.ts';
import { logger } from '../src/utils/logger.ts';

const operationName = 'getGoldenSets';

const query = new QueryBuilder(operationName)
  .withVariable('copilotType', 'DATA_MODEL_BUILDER')
  .select(
    'id',
    'projectExId',
    'schemaExId',
    'copilotType',
    'description',
    'query',
    'createdAt',
    'isActive'
  )
  .build();

graphqlUtils
  .accessEndpointWithQuery(query)
  .then((response) => {
    logger.info('GraphQL Response:', response);
  })
  .catch((error) => {
    logger.error('GraphQL Error:', error);
  });
