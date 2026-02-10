import { TypeSystemStore } from '../src/utils/zed/TypeSystemStore.ts';
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

const typeSystemStore = new TypeSystemStore();

typeSystemStore.rehydrate("l7YRy8qyJYN");