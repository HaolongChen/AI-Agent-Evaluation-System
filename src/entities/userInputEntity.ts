import type {
	MutationCreateUserInputArgs,
	UserInput,
} from "../graphql/generated/resolvers-types.ts";
import type { Prisma } from "@db/client";
import type {
	DbMethodArgContract,
	GraphqlActionContract,
} from "./bundleTypes.ts";

export type UserInputGraphql = {
	CreateUserInput: GraphqlActionContract<
		MutationCreateUserInputArgs,
		UserInput
	>;
	UserInput: UserInput;
};

type UserInputDbMethodArgs = {
	aggregate: Prisma.UserInputAggregateArgs;
	count: Prisma.userInputCountArgs;
	create: Prisma.userInputCreateArgs;
	createMany: Prisma.userInputCreateManyArgs;
	createManyAndReturn: Prisma.userInputCreateManyAndReturnArgs;
	delete: Prisma.userInputDeleteArgs;
	deleteMany: Prisma.userInputDeleteManyArgs;
	findFirst: Prisma.userInputFindFirstArgs;
	findFirstOrThrow: Prisma.userInputFindFirstOrThrowArgs;
	findMany: Prisma.userInputFindManyArgs;
	findUnique: Prisma.userInputFindUniqueArgs;
	findUniqueOrThrow: Prisma.userInputFindUniqueOrThrowArgs;
	groupBy: Prisma.userInputGroupByArgs;
	update: Prisma.userInputUpdateArgs;
	updateMany: Prisma.userInputUpdateManyArgs;
	updateManyAndReturn: Prisma.userInputUpdateManyAndReturnArgs;
	upsert: Prisma.userInputUpsertArgs;
};

export type UserInputPrisma = DbMethodArgContract<UserInputDbMethodArgs>;
