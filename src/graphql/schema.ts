import GraphQLJSON from 'graphql-type-json';
import { DateTimeResolver } from 'graphql-scalars';
import { analyticResolver } from './resolvers/AnalyticResolver.ts';
import { goldenResolver } from './resolvers/GoldenSetResolver.ts';
import { rubricResolver } from './resolvers/RubricResolver.ts';
import { sessionResolver } from './resolvers/SessionResolver.ts';
import { graphSessionResolver } from './resolvers/GraphSessionResolver.ts';
import { typeDefs } from './type/TypeDefs.ts';

const resolvers = {
  Query: {
    ...analyticResolver.Query,
    ...goldenResolver.Query,
    ...rubricResolver.Query,
    ...sessionResolver.Query,
    ...graphSessionResolver.Query,
  },
  Mutation: {
    ...analyticResolver.Mutation,
    ...goldenResolver.Mutation,
    ...rubricResolver.Mutation,
    ...sessionResolver.Mutation,
    ...graphSessionResolver.Mutation,
  },
  JSON: GraphQLJSON,
  DateTime: DateTimeResolver,
};

export { typeDefs, resolvers };
