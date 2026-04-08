import { prisma } from "@config/prisma";
import type { DBClientMethod } from "@src/entities/bundleTypes";
import type { EvaluationRecordPrisma } from "@src/entities/evaluationRecordEntity";
import {
	type DelegateMethodReturn,
	PrismaEntityInterface,
} from "./prismaEntityInterface.ts";

export class EvaluationRecordInterface<
	M extends DBClientMethod = DBClientMethod,
> extends PrismaEntityInterface<typeof prisma.evaluationRecord, EvaluationRecordPrisma, M> {
	constructor(method: M) {
		super(prisma.evaluationRecord, method);
	}

	public getEvaluationRecordAdapter(
		data: EvaluationRecordPrisma[M],
	): DelegateMethodReturn<(typeof prisma.evaluationRecord)[M]> {
		return this.invoke(data);
	}
}