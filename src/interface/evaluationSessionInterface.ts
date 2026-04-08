import { prisma } from "@config/prisma";
import type { DBClientMethod } from "@src/entities/bundleTypes";
import type { EvaluationSessionPrisma } from "@src/entities/evaluationSessionEntity";
import {
	type DelegateMethodReturn,
	PrismaEntityInterface,
} from "./prismaEntityInterface.ts";

export class EvaluationSessionInterface<
	M extends DBClientMethod = DBClientMethod,
> extends PrismaEntityInterface<
	typeof prisma.evaluationSession,
	EvaluationSessionPrisma,
	M
> {
	constructor(method: M) {
		super(prisma.evaluationSession, method);
	}

	public getEvaluationSessionAdapter(
		data: EvaluationSessionPrisma[M],
	): DelegateMethodReturn<(typeof prisma.evaluationSession)[M]> {
		return this.invoke(data);
	}
}