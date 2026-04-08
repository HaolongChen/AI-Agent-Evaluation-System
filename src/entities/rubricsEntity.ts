import type {
	QueryGetRubricByContextArgs,
	QueryGetRubricByIdArgs,
	Rubric,
} from "../graphql/generated/resolvers-types.ts";
import type { Prisma } from "@db/client";
import type {
	DbMethodArgContract,
	GraphqlActionContract,
} from "./bundleTypes.ts";

export type RubricGraphql = {
	GetRubricById: GraphqlActionContract<QueryGetRubricByIdArgs, Rubric>;
	GetRubricByContext: GraphqlActionContract<
		QueryGetRubricByContextArgs,
		Array<Rubric | undefined | null>
	>;
	Rubric: Rubric;
};

type RubricDbMethodArgs = {
	aggregate: Prisma.RubricAggregateArgs;
	count: Prisma.rubricCountArgs;
	create: Prisma.rubricCreateArgs;
	createMany: Prisma.rubricCreateManyArgs;
	createManyAndReturn: Prisma.rubricCreateManyAndReturnArgs;
	delete: Prisma.rubricDeleteArgs;
	deleteMany: Prisma.rubricDeleteManyArgs;
	findFirst: Prisma.rubricFindFirstArgs;
	findFirstOrThrow: Prisma.rubricFindFirstOrThrowArgs;
	findMany: Prisma.rubricFindManyArgs;
	findUnique: Prisma.rubricFindUniqueArgs;
	findUniqueOrThrow: Prisma.rubricFindUniqueOrThrowArgs;
	groupBy: Prisma.rubricGroupByArgs;
	update: Prisma.rubricUpdateArgs;
	updateMany: Prisma.rubricUpdateManyArgs;
	updateManyAndReturn: Prisma.rubricUpdateManyAndReturnArgs;
	upsert: Prisma.rubricUpsertArgs;
};

export type RubricPrisma = DbMethodArgContract<RubricDbMethodArgs>;
