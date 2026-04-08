import type {
	GoldenSet,
	MutationInitializeGoldenSetArgs,
	QueryGetGoldenSetByIdArgs,
	QueryGetGoldenSetsArgs,
} from "../graphql/generated/resolvers-types.ts";
import type { Prisma } from "@db/client";
import type {
	DbMethodArgContract,
	GraphqlActionContract,
} from "./bundleTypes.ts";

export type GoldenSetGraphql = {
	GetGoldenSetById: GraphqlActionContract<QueryGetGoldenSetByIdArgs, GoldenSet>;
	GetGoldenSets: GraphqlActionContract<
		QueryGetGoldenSetsArgs,
		Array<GoldenSet | undefined | null>
	>;
	InitializeGoldenSet: GraphqlActionContract<
		MutationInitializeGoldenSetArgs,
		GoldenSet
	>;
	GoldenSet: GoldenSet;
};

type GoldenSetDbMethodArgs = {
	aggregate: Prisma.GoldenSetAggregateArgs;
	count: Prisma.goldenSetCountArgs;
	create: Prisma.goldenSetCreateArgs;
	createMany: Prisma.goldenSetCreateManyArgs;
	createManyAndReturn: Prisma.goldenSetCreateManyAndReturnArgs;
	delete: Prisma.goldenSetDeleteArgs;
	deleteMany: Prisma.goldenSetDeleteManyArgs;
	findFirst: Prisma.goldenSetFindFirstArgs;
	findFirstOrThrow: Prisma.goldenSetFindFirstOrThrowArgs;
	findMany: Prisma.goldenSetFindManyArgs;
	findUnique: Prisma.goldenSetFindUniqueArgs;
	findUniqueOrThrow: Prisma.goldenSetFindUniqueOrThrowArgs;
	groupBy: Prisma.goldenSetGroupByArgs;
	update: Prisma.goldenSetUpdateArgs;
	updateMany: Prisma.goldenSetUpdateManyArgs;
	updateManyAndReturn: Prisma.goldenSetUpdateManyAndReturnArgs;
	upsert: Prisma.goldenSetUpsertArgs;
};

export type GoldenSetPrisma = DbMethodArgContract<GoldenSetDbMethodArgs>;
