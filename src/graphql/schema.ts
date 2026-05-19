import { goldenSetResolver } from "./resolvers/golden-set-resolver.ts";
import { rubricResolver } from "./resolvers/rubric-resolver.ts";
import { sessionResolver } from "./resolvers/session-resolver.ts";

import { readFile } from "node:fs/promises";

export const resolvers = {
  Query: {
    ...goldenSetResolver.Query,
    ...sessionResolver.Query,
    ...rubricResolver.Query,
  },
  Mutation: {
    ...goldenSetResolver.Mutation,
    ...sessionResolver.Mutation,
    ...rubricResolver.Mutation,
  },
};

export const typeDefs = await readFile("./src/graphql/type/schema.graphql", {
  encoding: "utf8",
});
