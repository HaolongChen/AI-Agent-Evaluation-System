import type {
	EvaluationResult,
	QueryGetEvaluationResultByIdArgs,
	QueryGetEvaluationResultsArgs,
} from "../graphql/generated/resolvers-types.ts";
import type { Prisma } from "@db/client";
import type {
	DbMethodArgContract,
	GraphqlActionContract,
} from "./bundleTypes.ts";

export type EvaluationResultGraphql = {
	GetEvaluationResultById: GraphqlActionContract<
		QueryGetEvaluationResultByIdArgs,
		EvaluationResult
	>;
	GetEvaluationResults: GraphqlActionContract<
		QueryGetEvaluationResultsArgs,
		Array<EvaluationResult | undefined | null>
	>;
	EvaluationResult: EvaluationResult;
};

type EvaluationResultDbMethodArgs = {
	aggregate: Prisma.EvaluationResultAggregateArgs;
	count: Prisma.evaluationResultCountArgs;
	create: Prisma.evaluationResultCreateArgs;
	createMany: Prisma.evaluationResultCreateManyArgs;
	createManyAndReturn: Prisma.evaluationResultCreateManyAndReturnArgs;
	delete: Prisma.evaluationResultDeleteArgs;
	deleteMany: Prisma.evaluationResultDeleteManyArgs;
	findFirst: Prisma.evaluationResultFindFirstArgs;
	findFirstOrThrow: Prisma.evaluationResultFindFirstOrThrowArgs;
	findMany: Prisma.evaluationResultFindManyArgs;
	findUnique: Prisma.evaluationResultFindUniqueArgs;
	findUniqueOrThrow: Prisma.evaluationResultFindUniqueOrThrowArgs;
	groupBy: Prisma.evaluationResultGroupByArgs;
	update: Prisma.evaluationResultUpdateArgs;
	updateMany: Prisma.evaluationResultUpdateManyArgs;
	updateManyAndReturn: Prisma.evaluationResultUpdateManyAndReturnArgs;
	upsert: Prisma.evaluationResultUpsertArgs;
};

export type EvaluationResultPrisma =
	DbMethodArgContract<EvaluationResultDbMethodArgs>;