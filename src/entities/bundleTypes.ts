export const DB_CLIENT_METHODS = [
	"aggregate",
	"count",
	"create",
	"createMany",
	"createManyAndReturn",
	"delete",
	"deleteMany",
	"findFirst",
	"findFirstOrThrow",
	"findMany",
	"findUnique",
	"findUniqueOrThrow",
	"groupBy",
	"update",
	"updateMany",
	"updateManyAndReturn",
	"upsert",
] as const;

export type DBClientMethod = (typeof DB_CLIENT_METHODS)[number];

export type GraphqlActionContract<TInput, TOutput> = {
	input: TInput;
	output: TOutput;
};

export type DbMethodArgMap = {
	[key in DBClientMethod]: unknown;
};

export type DbMethodArgContract<TMethodArgs extends DbMethodArgMap> = {
	[key in DBClientMethod]: TMethodArgs[key];
};
