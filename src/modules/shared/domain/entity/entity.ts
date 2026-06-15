import * as z from "zod";
import { Event } from "ts-event-target";

export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type IsEmptyObject<T extends object> =
	{
		[K in keyof T]: T[K];
	}[keyof T] extends never ?
		true
	:	false;

export type PickMethodNames<T> = {
	[K in ExcludePrivateMethodsNames<keyof T>]: T[K] extends (
		(...arguments_: unknown[]) => unknown
	) ?
		K
	:	never;
}[ExcludePrivateMethodsNames<keyof T>];

export type ExcludePrivateMethodsNames<T> =
	T extends string ?
		T extends `_${string}` ?
			never
		:	T
	:	never;

export class EntityEvent<
	T extends Pick<Entity, ExcludePrivateMethodsNames<keyof Entity>>,
	M extends PickMethodNames<T> = PickMethodNames<T>,
> extends Event<M> {
	constructor(
		type: M,
		readonly data: T[M] extends (...arguments_: [...infer R]) => unknown ? R
		:	never,
	) {
		super(type);
	}
}

export type ZodExtend<
	T extends z.ZodObject,
	E extends z.ZodObject,
> = z.ZodObject<T["shape"] & E["shape"]>;

export type EntityEventList<
	T extends Pick<Entity, ExcludePrivateMethodsNames<keyof Entity>>,
> = {
	[K in PickMethodNames<T>]: EntityEvent<T, K>;
}[PickMethodNames<T>];

export type EntityMetadata = {
	createdAt: z.infer<z.ZodDate> | undefined;
	updatedAt: z.infer<z.ZodDate> | undefined;
	id: string;
};

export type EntityKey<
	T extends z.ZodObject = z.ZodObject,
	M extends EntityMetadata = EntityMetadata,
> = IsEmptyObject<z.infer<T>> extends false ? keyof (z.infer<T> & M) : keyof M;

export type OneOrMany<T> = T | T[];

// type OneOrMoreEntityKey<
//   T extends z.ZodObject = z.ZodObject,
//   M extends EntityMetadata = EntityMetadata,
// > = OneOrMany<EntityKey<T, M>>;
export type RawEntityValue<
	T extends z.ZodObject,
	M extends EntityMetadata,
	K extends EntityKey<T, M>,
> =
	IsEmptyObject<z.infer<T>> extends true ? M[K & keyof M]
	: K extends keyof z.infer<T> ? z.infer<T>[K]
	: M[K & keyof M];

// type EntityValue<
//   T extends z.ZodObject,
//   M extends EntityMetadata,
//   K extends OneOrMoreEntityKey<T, M>,
// > =
//   K extends EntityKey<T, M>
//     ? RawEntityValue<T, M, K>
//     : { [Key in keyof K]: RawEntityValue<T, M, K[Key] & EntityKey<T, M>> };

export class Entity<
	T extends z.ZodObject = z.ZodObject,
	M extends EntityMetadata = EntityMetadata,
> {
	private _data: z.infer<T>;
	private _metadata: M;
	public schema: T;
	constructor(entity: Entity<T, M>);
	constructor(
		data: z.input<T>,
		schema: T,
		metadata: Omit<M, keyof EntityMetadata> & { id?: string },
	);
	constructor(
		argument1: Entity<T, M> | z.input<T>,
		argument2?: T,
		argument3?: Omit<M, keyof EntityMetadata> & { id?: string },
	) {
		if (argument1 instanceof Entity) {
			this._data = argument1._data;
			this._metadata = argument1._metadata;
			this.schema = argument1.schema;
		} else {
			if (!argument2 || !argument3) {
				throw new Error(
					"Schema and metadata must be provided when constructing with data.",
				);
			}
			this.schema = argument2;
			this._data = this.schema.parse(argument1);
			this._metadata = {
				...argument3,
				id: argument3.id ?? crypto.randomUUID(),
			} as M;
		}
	}

	// extend<Data extends z.ZodObject>(entity: {
	// 	data: z.input<Data>;
	// 	schema: Data;
	// }): Entity<ZodExtend<T, Data>, M> {
	// 	const newData = { ...this._data, ...entity.data };
	// 	const newSchema = this.schema.extend(entity.schema.shape);
	// 	return new Entity(newData, newSchema, this._metadata);
  // }

  // clone<Data>(metadata: Data): Entity<T, M & Data> {
  //   const newMetadata = { ...this._metadata, ...metadata };
  //   return new Entity(this._data, this.schema, newMetadata);
  // }

	getData<K extends EntityKey<T, M>>(keys: K): RawEntityValue<T, M, K>;
	getData(): z.infer<T> & M;
	getData<K extends EntityKey<T, M>>(
		keys?: K,
	): RawEntityValue<T, M, K> | (z.infer<T> & M) {
		if (keys) {
			if (Array.isArray(keys)) {
				if (keys.length === 0) {
					return this.getData();
				}
				// return keys.map((key) => this.getData(key)) as EntityValue<T, M, K>;
			} else {
				if (Object.keys(z.keyof(this.schema).enum).includes(keys as string)) {
					return this._data[keys as keyof z.infer<T>] as RawEntityValue<
						T,
						M,
						K
					>;
				}
				return this._metadata[keys as keyof M] as RawEntityValue<T, M, K>;
			}
		}
		return { ...this._data, ...this._metadata } as z.infer<T> & M;
	}

	setData<E extends EntityKey<T, M>>(pairs: {
		[Key in E]: RawEntityValue<T, M, Key>;
	}): void {
		for (const [key, value] of Object.entries(pairs) as [
			E,
			RawEntityValue<T, M, E>,
		][]) {
			if (Object.keys(this.schema.shape).includes(key as string)) {
				this._data[key as keyof z.infer<T>] =
					this.schema.shape[key as keyof typeof this.schema.shape].parse(value);
			} else if (key in this._metadata) {
				this._metadata[key as keyof M] = value as M[keyof M];
			} else {
				this._metadata[key as keyof M] = value as M[keyof M];
			}
		}
	}
}
