import type {
	CopilotOutput,
	MutationExecuteCopilotArgs,
} from "../graphql/generated/resolvers-types.ts";
import type { Prisma } from "@db/client";
import type {
	DbMethodArgContract,
	GraphqlActionContract,
} from "./bundleTypes.ts";

export type CopilotOutputGraphql = {
	ExecuteCopilot: GraphqlActionContract<
		MutationExecuteCopilotArgs,
		CopilotOutput
	>;
	CopilotOutput: CopilotOutput;
};

type CopilotOutputDbMethodArgs = {
	aggregate: Prisma.CopilotOutputAggregateArgs;
	count: Prisma.copilotOutputCountArgs;
	create: Prisma.copilotOutputCreateArgs;
	createMany: Prisma.copilotOutputCreateManyArgs;
	createManyAndReturn: Prisma.copilotOutputCreateManyAndReturnArgs;
	delete: Prisma.copilotOutputDeleteArgs;
	deleteMany: Prisma.copilotOutputDeleteManyArgs;
	findFirst: Prisma.copilotOutputFindFirstArgs;
	findFirstOrThrow: Prisma.copilotOutputFindFirstOrThrowArgs;
	findMany: Prisma.copilotOutputFindManyArgs;
	findUnique: Prisma.copilotOutputFindUniqueArgs;
	findUniqueOrThrow: Prisma.copilotOutputFindUniqueOrThrowArgs;
	groupBy: Prisma.copilotOutputGroupByArgs;
	update: Prisma.copilotOutputUpdateArgs;
	updateMany: Prisma.copilotOutputUpdateManyArgs;
	updateManyAndReturn: Prisma.copilotOutputUpdateManyAndReturnArgs;
	upsert: Prisma.copilotOutputUpsertArgs;
};

export type CopilotOutputPrisma = DbMethodArgContract<CopilotOutputDbMethodArgs>;