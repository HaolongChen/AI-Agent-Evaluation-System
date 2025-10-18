import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './schema/resolvers.js';
import type { Express as ExpressApplication } from 'express-serve-static-core';

const server: ApolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});
await server.start();
const app: ExpressApplication = express();
const port: number = (process.env['PORT'] as unknown as number) || 4000;
server.applyMiddleware({ app, path: '/api/graphql' });

app.get('/health', (_, res) => {
  res.send('server is healthy');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
