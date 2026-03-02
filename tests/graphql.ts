import { GoldenSetDocuments, type GetGoldenSetsVariables } from '../src/utils/graphql-builder.ts';
import { localClient, gqlRequest } from '../src/utils/graphql-client.ts';
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

interface GoldenSet {
  id: number;
  projectExId: string;
  copilotType: string;
  description: string;
  query: string;
  createdAt: string;
  isActive: boolean;
}

interface GetGoldenSetsResponse {
  getGoldenSets: GoldenSet[];
}

async function main(): Promise<void> {
  let exitCode = 0;
  try {
    const variables: GetGoldenSetsVariables = { copilotType: 'DATA_MODEL_BUILDER' };
    const response = await gqlRequest<GetGoldenSetsResponse, GetGoldenSetsVariables>(
      localClient,
      GoldenSetDocuments.getGoldenSets,
      variables,
    );
    logger.info('GraphQL Response:', response);
  } catch (error) {
    logger.error('GraphQL Error:', error);
    exitCode = 1;
  }
  process.exit(exitCode);
}

main();
