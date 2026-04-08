import type { Prisma } from "@db/client";
import type { DbMethodArgContract } from "./bundleTypes.ts";

type CopilotOutputRubricDbMethodArgs = {
	aggregate: Prisma.CopilotOutput_rubricAggregateArgs;
	count: Prisma.copilotOutput_rubricCountArgs;
	create: Prisma.copilotOutput_rubricCreateArgs;
	createMany: Prisma.copilotOutput_rubricCreateManyArgs;
	createManyAndReturn: Prisma.copilotOutput_rubricCreateManyAndReturnArgs;
	delete: Prisma.copilotOutput_rubricDeleteArgs;
	deleteMany: Prisma.copilotOutput_rubricDeleteManyArgs;
	findFirst: Prisma.copilotOutput_rubricFindFirstArgs;
	findFirstOrThrow: Prisma.copilotOutput_rubricFindFirstOrThrowArgs;
	findMany: Prisma.copilotOutput_rubricFindManyArgs;
	findUnique: Prisma.copilotOutput_rubricFindUniqueArgs;
	findUniqueOrThrow: Prisma.copilotOutput_rubricFindUniqueOrThrowArgs;
	groupBy: Prisma.copilotOutput_rubricGroupByArgs;
	update: Prisma.copilotOutput_rubricUpdateArgs;
	updateMany: Prisma.copilotOutput_rubricUpdateManyArgs;
	updateManyAndReturn: Prisma.copilotOutput_rubricUpdateManyAndReturnArgs;
	upsert: Prisma.copilotOutput_rubricUpsertArgs;
};

export type CopilotOutputRubricPrisma =
	DbMethodArgContract<CopilotOutputRubricDbMethodArgs>;
