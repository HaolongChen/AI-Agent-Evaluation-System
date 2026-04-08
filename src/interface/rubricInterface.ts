import { prisma } from "@config/prisma";
import type { DBClientMethod } from "@src/entities/bundleTypes";
import type { RubricPrisma } from "@src/entities/rubricsEntity";
import {
	type DelegateMethodReturn,
	PrismaEntityInterface,
} from "./prismaEntityInterface.ts";

export class RubricInterface<
	M extends DBClientMethod = DBClientMethod,
> extends PrismaEntityInterface<typeof prisma.rubric, RubricPrisma, M> {
	constructor(method: M) {
		super(prisma.rubric, method);
	}

	public getRubricAdapter(
		data: RubricPrisma[M],
	): DelegateMethodReturn<(typeof prisma.rubric)[M]> {
		return this.invoke(data);
	}
}
