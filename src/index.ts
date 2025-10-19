import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import express from 'express';
import cors from 'cors';
import { typeDefs, resolvers } from './graphql/schema.ts';
import { PORT } from './config/env.ts';
import { logger } from './utils/logger.ts';

const app = express();
logger.info('Starting server...');
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

await server.start();

app.use(
  '/graphql',
  cors(),
  express.json(),
  express.urlencoded({ extended: true }),
  expressMiddleware(server)
);
app.get('/health', (_req: express.Request, res: express.Response) => {
  res.send('server is healthy');
});

app.listen({ port: PORT }, () => {
  logger.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
});
