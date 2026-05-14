import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

dotenvExpand.expand(dotenv.config());
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import express from "express";
import cors from "cors";
import { typeDefs, resolvers } from "./graphql/schema.ts";
import { authState } from "./modules/shared/application/graphql-client.ts";
import { Account } from "./modules/account/application/account-handler.ts";

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
  console.info(
    `🚀 Server ready at http://localhost:${process.env.PORT}/graphql`,
  );
});

try {
  if (!process.env.FUNCTORZ_PHONE_NUMBER || !process.env.FUNCTORZ_PASSWORD) {
    throw new Error(
      "FUNCTORZ_PHONE_NUMBER and FUNCTORZ_PASSWORD are required for initial login",
    );
  }

  const personalAccount = new Account(
    process.env.FUNCTORZ_PHONE_NUMBER,
    process.env.FUNCTORZ_PASSWORD,
  );
  await personalAccount.ensureLoggedIn();
  authState.setToken(personalAccount.accessToken);
  console.info("Initial login successful, token obtained");
} catch (error) {
  console.error(
    "Initial login failed — server will continue, authenticated requests will re-auth on demand",
    error,
  );
}
