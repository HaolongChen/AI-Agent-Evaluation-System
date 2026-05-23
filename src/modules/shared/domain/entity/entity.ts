import * as z from "zod";
import type { GoldenSetEntity } from "../../../copilot-input/domain/entity/golden-set.entity.ts";
export type EntityMetadata = {
	createdAt: z.infer<z.ZodDate> | undefined;
	updatedAt: z.infer<z.ZodDate> | undefined;
	id: string;
};

class sdfsdf
{
  constructor ( goldenSet: GoldenSetEntity )
  {
    const data = goldenSet.getData(["copilotType", "copilotType", "copilotType", ]);
  }
}

type test = EntityValue<typeof GoldenSetEntity.prototype.schema, EntityMetadata, ["copilotType", "id"]>;

type EntityKey<
	T extends z.ZodObject = z.ZodObject,
	M extends EntityMetadata = EntityMetadata,
> = keyof (z.infer<T> & M);

type OneOrMoreEntityKey<
	T extends z.ZodObject = z.ZodObject,
  M extends EntityMetadata = EntityMetadata,
  E extends EntityKey<T, M> = EntityKey<T, M>,
> = [E, ...E[]] | E;
type OneOrMoreEntityValue<
	T extends z.ZodObject,
	M extends EntityMetadata,
	K extends EntityKey<T, M>
> =
	K extends keyof z.infer<T> ? z.infer<T>[K]
	: K extends keyof M ? M[K]
	: never;

type EntityValue<
	T extends z.ZodObject,
	M extends EntityMetadata,
	K extends OneOrMoreEntityKey<T, M>,
> =
	K extends EntityKey<T, M> ? OneOrMoreEntityValue<T, M, K>
	: K extends readonly EntityKey<T, M>[]
		? { [Key in K[number]]: OneOrMoreEntityValue<T, M, Key> }
		: never;

export class Entity<
	T extends z.ZodObject = z.ZodObject,
	M extends EntityMetadata = EntityMetadata,
> {
	private _data: z.infer<T>;
	private _metadata: M;
	public schema: T;
	constructor(entity: Entity<T, M>);
	constructor(data: z.infer<T>, schema: T, id?: string);
	constructor(
		argument1: Entity<T, M> | z.infer<T>,
		argument2?: T,
		argument3?: string,
	) {
		if (argument1 instanceof Entity) {
			this._data = argument1._data;
			this._metadata = argument1._metadata;
			this.schema = argument1.schema;
		} else {
			if (!argument2) {
				throw new Error("Schema must be provided when constructing with data.");
			}
			this.schema = argument2;
			this._data = this.schema.parse(argument1);
			this._metadata = {
				id: argument3 ? z.uuidv4().parse(argument3) : crypto.randomUUID(),
			} as M;
		}
	}

	getData<K extends OneOrMoreEntityKey<T, M>>(keys: K): EntityValue<T, M, K>[keyof EntityValue<T, M, K>];
	getData(): z.infer<T> & M;
	getData<K extends OneOrMoreEntityKey<T, M>>(
		keys?: K,
	): EntityValue<T, M, K>[keyof EntityValue<T, M, K>] | (z.infer<T> & M) {
		if (keys) {
			if (Array.isArray(keys)) {
				if (keys.length === 0) {
					return this.getData();
				}
				return keys.map((key) => this.getData(key)) as EntityValue<T, M, K>[keyof EntityValue<T, M, K>];
			} else {
				if (Object.keys(this._data).includes(keys as string)) {
					return this._data[keys as keyof z.infer<T>] as EntityValue<T, M, K>[keyof EntityValue<T, M, K>];
				}
				return this._metadata[keys as keyof M] as EntityValue<T, M, K>[keyof EntityValue<T, M, K>];
			}
		}
		return { ...this._data, ...this._metadata } as z.infer<T> & M;
	}

	setData(pair: [EntityKey<T, M>, EntityValue<T, M, EntityKey<T, M>>]): void;
	setData(
		...pairs: [EntityKey<T, M>, EntityValue<T, M, EntityKey<T, M>>][]
	): void;
	setData(
		...pairs: [...[EntityKey<T, M>, EntityValue<T, M, EntityKey<T, M>>][]]
	): void {
		if (Array.isArray(pairs)) {
			for (const pair of pairs) {
				this.setData(pair);
			}
			return;
		}
		if (pairs[0] in this._data) {
			this._data[pairs[0] as keyof z.infer<T>] = this.schema.shape[
				pairs[0] as keyof typeof this.schema.shape
			].parse(pairs[1]);
		} else {
			this._metadata[pairs[0] as keyof M] = pairs[1] as M[keyof M];
		}
	}
}
