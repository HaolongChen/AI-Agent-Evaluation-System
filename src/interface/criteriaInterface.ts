import { prisma } from "@config/prisma";
import type { DBClientMethod } from "@src/entities/bundleTypes";
import type { CriteriaPrisma } from "@src/entities/criteriaEntity";
import {
	type DelegateMethodReturn,
	PrismaEntityInterface,
} from "./prismaEntityInterface.ts";

export class CriteriaInterface<
	M extends DBClientMethod = DBClientMethod,
> extends PrismaEntityInterface<typeof prisma.criteria, CriteriaPrisma, M> {
	constructor(method: M) {
		super(prisma.criteria, method);
	}

	public getCriteriaAdapter(
		data: CriteriaPrisma[M],
	): DelegateMethodReturn<(typeof prisma.criteria)[M]> {
		return this.invoke(data);
	}
}
