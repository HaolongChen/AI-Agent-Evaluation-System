import type { Prisma } from "@db/client";
import type { DbMethodArgContract } from "./bundleTypes.ts";

type AgentFeedbacksDbMethodArgs = {
	aggregate: Prisma.AgentFeedbacksAggregateArgs;
	count: Prisma.agentFeedbacksCountArgs;
	create: Prisma.agentFeedbacksCreateArgs;
	createMany: Prisma.agentFeedbacksCreateManyArgs;
	createManyAndReturn: Prisma.agentFeedbacksCreateManyAndReturnArgs;
	delete: Prisma.agentFeedbacksDeleteArgs;
	deleteMany: Prisma.agentFeedbacksDeleteManyArgs;
	findFirst: Prisma.agentFeedbacksFindFirstArgs;
	findFirstOrThrow: Prisma.agentFeedbacksFindFirstOrThrowArgs;
	findMany: Prisma.agentFeedbacksFindManyArgs;
	findUnique: Prisma.agentFeedbacksFindUniqueArgs;
	findUniqueOrThrow: Prisma.agentFeedbacksFindUniqueOrThrowArgs;
	groupBy: Prisma.agentFeedbacksGroupByArgs;
	update: Prisma.agentFeedbacksUpdateArgs;
	updateMany: Prisma.agentFeedbacksUpdateManyArgs;
	updateManyAndReturn: Prisma.agentFeedbacksUpdateManyAndReturnArgs;
	upsert: Prisma.agentFeedbacksUpsertArgs;
};

export type AgentFeedbacksPrisma = DbMethodArgContract<AgentFeedbacksDbMethodArgs>;