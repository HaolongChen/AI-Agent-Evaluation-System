import { prisma } from "@config/prisma";
import type { DBClientMethod } from "@src/entities/bundleTypes";
import type { UserInputPrisma } from "@src/entities/userInputEntity";
import {
	type DelegateMethodReturn,
	PrismaEntityInterface,
} from "./prismaEntityInterface.ts";

export class UserInputInterface<
	M extends DBClientMethod = DBClientMethod,
> extends PrismaEntityInterface<typeof prisma.userInput, UserInputPrisma, M> {
	constructor(method: M) {
		super(prisma.userInput, method);
	}

	public getUserInputAdapter(
		data: UserInputPrisma[M],
	): DelegateMethodReturn<(typeof prisma.userInput)[M]> {
		return this.invoke(data);
	}
}
