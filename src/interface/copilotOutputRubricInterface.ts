import { prisma } from "@config/prisma";
import type { DBClientMethod } from "@src/entities/bundleTypes";
import type { CopilotOutputRubricPrisma } from "@src/entities/copilotOutputRubricEntity";
import {
	type DelegateMethodReturn,
	PrismaEntityInterface,
} from "./prismaEntityInterface.ts";

export class CopilotOutputRubricInterface<
	M extends DBClientMethod = DBClientMethod,
> extends PrismaEntityInterface<
	typeof prisma.copilotOutput_rubric,
	CopilotOutputRubricPrisma,
	M
> {
	constructor(method: M) {
		super(prisma.copilotOutput_rubric, method);
	}

	public getCopilotOutputRubricAdapter(
		data: CopilotOutputRubricPrisma[M],
	): DelegateMethodReturn<(typeof prisma.copilotOutput_rubric)[M]> {
		return this.invoke(data);
	}
}