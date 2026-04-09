import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import express from "express";
import cors from "cors";
import { typeDefs, resolvers } from "./graphql/schema.ts";

import { login } from "./external/login.ts";
import { authState } from "./external/graphql-client.ts";

const app = express();
console.info("Starting server...");
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
app.get("/health", (_request: express.Request, res: express.Response) => {
	res.send("server is healthy");
});

app.listen({ port: process.env.PORT }, () => {
	console.info(`🚀 Server ready at http://localhost:${process.env.PORT}/graphql`);
});


try {
	if (!process.env.FUNCTORZ_PHONE_NUMBER || !process.env.FUNCTORZ_PASSWORD) {
		throw new Error(
			"FUNCTORZ_PHONE_NUMBER and FUNCTORZ_PASSWORD are required for initial login",
		);
	}
	const token = await login(process.env.FUNCTORZ_PHONE_NUMBER, process.env.FUNCTORZ_PASSWORD);
	console.info("Initial login successful, token obtained");
	authState.setToken(token);
} catch (error) {
	console.error(
		"Initial login failed — server will continue, TypeSystemStore will re-auth on demand",
		error,
	);
}
