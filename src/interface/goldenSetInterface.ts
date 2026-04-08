import { prisma } from "@config/prisma";
import type { DBClientMethod } from "@src/entities/bundleTypes";
import type { GoldenSetPrisma } from "@src/entities/goldenSetEntity";
import {
	type DelegateMethodReturn,
	PrismaEntityInterface,
} from "./prismaEntityInterface.ts";

export class GoldenSetInterface<
	M extends DBClientMethod = DBClientMethod,
> extends PrismaEntityInterface<typeof prisma.goldenSet, GoldenSetPrisma, M> {
	constructor(method: M) {
		super(prisma.goldenSet, method);
	}

	public getGoldenSetAdapter(
		data: GoldenSetPrisma[M],
	): DelegateMethodReturn<(typeof prisma.goldenSet)[M]> {
		return this.invoke(data);
	}
}
