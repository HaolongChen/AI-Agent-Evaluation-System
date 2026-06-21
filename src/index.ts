import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import express from "express";
import cors from "cors";
import { typeDefs, resolvers } from "./graphql/schema.ts";
import { logger } from "./modules/shared/infrastructure/logger.ts";
import type { GraphQLContext } from "./config/graphql.ts";
import {
  createApplicationServiceBundle,
  infrastructureServiceBundle,
} from "./DI/service.ts";
import { NetworkClient } from "./modules/account/domain/entity/network-client.entity.ts";
import { createRepositoryBundle } from "./DI/repository.ts";
import { CopilotExecutionPool, EventBus } from "./config/event-bus.ts";

const app = express();
const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: true,
});

await server.start();

const copilotSessionEventBus = new EventBus();
const repositoryBundle = createRepositoryBundle(copilotSessionEventBus);
const copilotExecutionPool = new CopilotExecutionPool();
const applicationServiceBundle = createApplicationServiceBundle(
  repositoryBundle,

  app.use(
    "/graphql",
    cors(),
    express.json(),
    express.urlencoded({ extended: true }),
    expressMiddleware(server, {
      context: async () => {
        return {
          copilotSessionEventBus,
          account:
            await applicationServiceBundle.accountApplicationService.loginWithPhoneNumber(
              process.env.FUNCTORZ_PHONE_NUMBER,
              process.env.FUNCTORZ_PASSWORD,
              NetworkClient.createDefault(),
            ),
          repositoryBundle: createRepositoryBundle(copilotSessionEventBus),
          infrastructureServiceBundle,
          applicationServiceBundle,
        };
      },
    }),
  ),
);
app.get("/health", (_request: express.Request, result: express.Response) => {
  result.send("server is healthy");
});

app.listen({ port: process.env.PORT }, () => {
  logger.info(
    `🚀 Server ready at http://localhost:${process.env.PORT}/graphql`,
  );
});
