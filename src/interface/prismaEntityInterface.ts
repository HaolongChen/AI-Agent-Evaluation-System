import type { DBClientMethod, DbMethodArgMap } from "@src/entities/bundleTypes";

export type DelegateMethodReturn<TMethod> =
	TMethod extends (...args: infer _TArgs) => infer TResult ? TResult : never;

export class PrismaEntityInterface<
	TDelegate extends Record<DBClientMethod, unknown>,
	TMethodArgs extends DbMethodArgMap,
	M extends DBClientMethod = DBClientMethod,
> {
	private readonly delegate: TDelegate;
	protected readonly method: M;

	constructor(delegate: TDelegate, method: M) {
		this.delegate = delegate;
		this.method = method;
	}

	protected invoke(data: TMethodArgs[M]): DelegateMethodReturn<TDelegate[M]> {
		const delegateMethod = this.delegate[this.method] as (
			args: TMethodArgs[M],
		) => DelegateMethodReturn<TDelegate[M]>;
		return delegateMethod(data);
	}
}
