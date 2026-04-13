import { goldenSetResolver } from "./resolvers/golden-set-resolver.ts";
import { rubricResolver } from "./resolvers/rubric-resolver.ts";
import { sessionResolver } from "./resolvers/session-resolver.ts";


const resolvers = {
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

export {  resolvers };

export {typeDefs} from './type/TypeDefs.ts';