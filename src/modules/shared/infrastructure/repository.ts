import type z from "zod";
import type { Entity } from "../domain/entity/entity.ts";
import type { BaseOptions } from "../domain/interface/repository.interface.ts";

export interface ExternalRepositoryDate {
	createdAt?: z.infer<z.ZodDate>;
	updatedAt?: z.infer<z.ZodDate>;
}

export function repositoryDateMapper<T extends z.ZodObject>(
	data: ExternalRepositoryDate,
	entity: Entity<T>,
) {
	entity.setData({ createdAt: data.createdAt, updatedAt: data.updatedAt });
	return entity;
}

export const optionsToInclude = <
	T extends string = string,
	E extends string = string,
	U extends string = string,
>(
	options: BaseOptions<T, E, U>,
) => {
	if (!options.options) {
		return { [options.name]: true };
	}
	const include: Record<keyof typeof options.options, unknown> = {} as Record<
		keyof typeof options.options,
		unknown
	>;
	for (const [key, value] of Object.entries(options.options) as [
		U extends string ? Exclude<U, E> : never,
		BaseOptions | boolean,
	][]) {
		if (typeof value === "boolean") {
			include[key] = value;
		} else {
			const next = optionsToInclude(value);
			include[key] =
				typeof next[key] === "boolean" ?
					(next[key] as boolean)
				:	next[key]["include"];
		}
	}
	return { [options.name]: { include: include } };
};
