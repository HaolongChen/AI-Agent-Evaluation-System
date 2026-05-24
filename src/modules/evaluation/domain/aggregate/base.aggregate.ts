/* eslint-disable @typescript-eslint/no-explicit-any */

import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type {
	Entity,
	EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import { BaseSessionEntity } from "../entity/session.entity.ts";
import type { sessionIdentifierSchema } from "../schema/session.schema.ts";

export type PickMethodNames<T> = {
	[K in keyof T]: T[K] extends (...arguments_: any[]) => any ? K : never;
}[keyof T];

export class BaseSessionAggregateRoot<
	T extends typeof sessionIdentifierSchema,
	AEP extends Record<string, Entity> = Record<string, Entity>,
> extends BaseSessionEntity<T> {
	private baseAggregate: AggregateRoot<T, EntityMetadata, AEP>;
	constructor(entity: BaseSessionEntity<T>) {
		super(entity);
		this.baseAggregate = new AggregateRoot<T, EntityMetadata, AEP>(entity);
	}

	self<K extends keyof AEP>(method: "getEntity", arguments_: [K]): AEP[K][];
	self<K extends keyof AEP>(
		method: "pushEntity" | "setEntity",
		arguments_: [K, AEP[K] | AEP[K][]],
	): void;
	self<
		K extends PickMethodNames<AggregateRoot<T, EntityMetadata, AEP>>,
		Arguments_ extends any[],
	>(method: K, arguments_: Arguments_): any;
	self(method: string, arguments__: any[]): any {
		const callable = this.baseAggregate[
			method as keyof typeof this.baseAggregate
		] as (...arguments_: any[]) => unknown;
		return callable(...arguments__);
	}
}
