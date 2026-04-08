import { prisma } from "@config/prisma";
import type { DBClientMethod } from "@src/entities/bundleTypes";
import type { EvaluationResultPrisma } from "@src/entities/evaluationResultEntity";
import {
	type DelegateMethodReturn,
	PrismaEntityInterface,
} from "./prismaEntityInterface.ts";

export class EvaluationResultInterface<
	M extends DBClientMethod = DBClientMethod,
> extends PrismaEntityInterface<typeof prisma.evaluationResult, EvaluationResultPrisma, M> {
	constructor(method: M) {
		super(prisma.evaluationResult, method);
	}

	public getEvaluationResultAdapter(
		data: EvaluationResultPrisma[M],
	): DelegateMethodReturn<(typeof prisma.evaluationResult)[M]> {
		return this.invoke(data);
	}
}