import { prisma } from "@config/prisma";
import type { DBClientMethod } from "@src/entities/bundleTypes";
import type { CopilotOutputPrisma } from "@src/entities/copilotOutputEntity";
import {
	type DelegateMethodReturn,
	PrismaEntityInterface,
} from "./prismaEntityInterface.ts";

export class CopilotOutputInterface<
	M extends DBClientMethod = DBClientMethod,
> extends PrismaEntityInterface<
	typeof prisma.copilotOutput,
	CopilotOutputPrisma,
	M
> {
	constructor(method: M) {
		super(prisma.copilotOutput, method);
	}

	public getCopilotOutputAdapter(
		data: CopilotOutputPrisma[M],
	): DelegateMethodReturn<(typeof prisma.copilotOutput)[M]> {
		return this.invoke(data);
	}
}
