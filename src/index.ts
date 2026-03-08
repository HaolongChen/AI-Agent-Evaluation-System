import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import express from 'express';
import cors from 'cors';
import { typeDefs, resolvers } from './graphql/schema.ts';
import { PORT } from './config/env.ts';
import { logger } from './utils/logger.ts';
import { login } from './utils/login.ts';
import { authState } from './utils/graphql-client.ts';

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

import { FUNCTORZ_PHONE_NUMBER, FUNCTORZ_PASSWORD } from './config/env.ts';

try {
  if (!FUNCTORZ_PHONE_NUMBER || !FUNCTORZ_PASSWORD) {
    throw new Error('FUNCTORZ_PHONE_NUMBER and FUNCTORZ_PASSWORD are required for initial login');
  }
  const token = await login(FUNCTORZ_PHONE_NUMBER, FUNCTORZ_PASSWORD);
  logger.info('Initial login successful, token obtained');
  authState.setToken(token);
} catch (err) {
  logger.error('Initial login failed — server will continue, TypeSystemStore will re-auth on demand', err);
}