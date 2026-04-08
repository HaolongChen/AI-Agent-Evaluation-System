import type { Criteria } from "../graphql/generated/resolvers-types.ts";
import type { Prisma } from "@db/client";
import type { DbMethodArgContract } from "./bundleTypes.ts";

export type CriteriaGraphql = {
	Criteria: Criteria;
};

type CriteriaDbMethodArgs = {
	aggregate: Prisma.CriteriaAggregateArgs;
	count: Prisma.criteriaCountArgs;
	create: Prisma.criteriaCreateArgs;
	createMany: Prisma.criteriaCreateManyArgs;
	createManyAndReturn: Prisma.criteriaCreateManyAndReturnArgs;
	delete: Prisma.criteriaDeleteArgs;
	deleteMany: Prisma.criteriaDeleteManyArgs;
	findFirst: Prisma.criteriaFindFirstArgs;
	findFirstOrThrow: Prisma.criteriaFindFirstOrThrowArgs;
	findMany: Prisma.criteriaFindManyArgs;
	findUnique: Prisma.criteriaFindUniqueArgs;
	findUniqueOrThrow: Prisma.criteriaFindUniqueOrThrowArgs;
	groupBy: Prisma.criteriaGroupByArgs;
	update: Prisma.criteriaUpdateArgs;
	updateMany: Prisma.criteriaUpdateManyArgs;
	updateManyAndReturn: Prisma.criteriaUpdateManyAndReturnArgs;
	upsert: Prisma.criteriaUpsertArgs;
};

export type CriteriaPrisma = DbMethodArgContract<CriteriaDbMethodArgs>;
