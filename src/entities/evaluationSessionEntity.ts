import type {
	EvaluationSession,
	MutationSubmitHumanEvaluationArgs,
	QueryGetEvaluationSessionByIdArgs,
	QueryGetEvaluationSessionsArgs,
} from "../graphql/generated/resolvers-types.ts";
import type { Prisma } from "@db/client";
import type {
	DbMethodArgContract,
	GraphqlActionContract,
} from "./bundleTypes.ts";

export type EvaluationSessionGraphql = {
	GetEvaluationSessionById: GraphqlActionContract<
		QueryGetEvaluationSessionByIdArgs,
		EvaluationSession
	>;
	GetEvaluationSessions: GraphqlActionContract<
		QueryGetEvaluationSessionsArgs,
		Array<EvaluationSession | undefined | null>
	>;
	SubmitHumanEvaluation: GraphqlActionContract<
		MutationSubmitHumanEvaluationArgs,
		EvaluationSession
	>;
	EvaluationSession: EvaluationSession;
};

type EvaluationSessionDbMethodArgs = {
	aggregate: Prisma.EvaluationSessionAggregateArgs;
	count: Prisma.evaluationSessionCountArgs;
	create: Prisma.evaluationSessionCreateArgs;
	createMany: Prisma.evaluationSessionCreateManyArgs;
	createManyAndReturn: Prisma.evaluationSessionCreateManyAndReturnArgs;
	delete: Prisma.evaluationSessionDeleteArgs;
	deleteMany: Prisma.evaluationSessionDeleteManyArgs;
	findFirst: Prisma.evaluationSessionFindFirstArgs;
	findFirstOrThrow: Prisma.evaluationSessionFindFirstOrThrowArgs;
	findMany: Prisma.evaluationSessionFindManyArgs;
	findUnique: Prisma.evaluationSessionFindUniqueArgs;
	findUniqueOrThrow: Prisma.evaluationSessionFindUniqueOrThrowArgs;
	groupBy: Prisma.evaluationSessionGroupByArgs;
	update: Prisma.evaluationSessionUpdateArgs;
	updateMany: Prisma.evaluationSessionUpdateManyArgs;
	updateManyAndReturn: Prisma.evaluationSessionUpdateManyAndReturnArgs;
	upsert: Prisma.evaluationSessionUpsertArgs;
};

export type EvaluationSessionPrisma =
	DbMethodArgContract<EvaluationSessionDbMethodArgs>;
