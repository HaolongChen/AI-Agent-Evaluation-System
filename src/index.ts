import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import express from "express";
import cors from "cors";
import { typeDefs, resolvers } from "./graphql/schema.ts";
import { logger } from "./modules/shared/infrastructure/logger.ts";

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

await server.start();
app.use(
  "/graphql",
  cors(),
  express.json(),
  express.urlencoded({ extended: true }),
  expressMiddleware(server),
);
app.get("/health", (_request: express.Request, result: express.Response) => {
  result.send("server is healthy");
});

app.listen({ port: process.env.PORT }, () => {
  logger.info(
    `🚀 Server ready at http://localhost:${process.env.PORT}/graphql`,
  );
});
