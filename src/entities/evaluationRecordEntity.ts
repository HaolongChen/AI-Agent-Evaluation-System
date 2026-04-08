import type { EvaluationRecord } from "../graphql/generated/resolvers-types.ts";
import type { Prisma } from "@db/client";
import type { DbMethodArgContract } from "./bundleTypes.ts";

export type EvaluationRecordGraphql = {
	EvaluationRecord: EvaluationRecord;
};

type EvaluationRecordDbMethodArgs = {
	aggregate: Prisma.EvaluationRecordAggregateArgs;
	count: Prisma.evaluationRecordCountArgs;
	create: Prisma.evaluationRecordCreateArgs;
	createMany: Prisma.evaluationRecordCreateManyArgs;
	createManyAndReturn: Prisma.evaluationRecordCreateManyAndReturnArgs;
	delete: Prisma.evaluationRecordDeleteArgs;
	deleteMany: Prisma.evaluationRecordDeleteManyArgs;
	findFirst: Prisma.evaluationRecordFindFirstArgs;
	findFirstOrThrow: Prisma.evaluationRecordFindFirstOrThrowArgs;
	findMany: Prisma.evaluationRecordFindManyArgs;
	findUnique: Prisma.evaluationRecordFindUniqueArgs;
	findUniqueOrThrow: Prisma.evaluationRecordFindUniqueOrThrowArgs;
	groupBy: Prisma.evaluationRecordGroupByArgs;
	update: Prisma.evaluationRecordUpdateArgs;
	updateMany: Prisma.evaluationRecordUpdateManyArgs;
	updateManyAndReturn: Prisma.evaluationRecordUpdateManyAndReturnArgs;
	upsert: Prisma.evaluationRecordUpsertArgs;
};

export type EvaluationRecordPrisma =
	DbMethodArgContract<EvaluationRecordDbMethodArgs>;
