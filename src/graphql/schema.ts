import { goldenSetResolver } from "./resolvers/GoldenSetResolver.ts";
import { rubricResolver } from "./resolvers/RubricResolver.ts";
import { sessionResolver } from "./resolvers/SessionResolver.ts";


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