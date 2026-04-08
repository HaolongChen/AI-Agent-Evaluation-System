import { prisma } from "@config/prisma";
import type { DBClientMethod } from "@src/entities/bundleTypes";
import type { AgentFeedbacksPrisma } from "@src/entities/agentFeedbacksEntity";
import {
	type DelegateMethodReturn,
	PrismaEntityInterface,
} from "./prismaEntityInterface.ts";

export class AgentFeedbacksInterface<
	M extends DBClientMethod = DBClientMethod,
> extends PrismaEntityInterface<
	typeof prisma.agentFeedbacks,
	AgentFeedbacksPrisma,
	M
> {
	constructor(method: M) {
		super(prisma.agentFeedbacks, method);
	}

	public getAgentFeedbacksAdapter(
		data: AgentFeedbacksPrisma[M],
	): DelegateMethodReturn<(typeof prisma.agentFeedbacks)[M]> {
		return this.invoke(data);
	}
}
