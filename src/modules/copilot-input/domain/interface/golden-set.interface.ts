import type z from "zod";
import type {
	ExcludeOptions,
	IRepository,
} from "../../../shared/domain/interface/repository.interface.ts";
import type { GoldenSetEntity } from "../entity/golden-set.entity.ts";
import type { goldenSetFiltersSchema } from "../schema/golden-set.schema.ts";
import type {
	CopilotInputOptions,
	CopilotInputReturnType,
} from "./copilot-input.interface.ts";

export type GoldenSetOptions = {
	name: "goldenSet";
	options: {
		copilotInput: ExcludeOptions<CopilotInputOptions, "goldenSet"> | boolean;
	};
};

export type GoldenSetReturnType<T> =
	T extends Partial<GoldenSetOptions> ?
		{
			entity: GoldenSetEntity;
			copilotInput: ExcludeOptions<
				CopilotInputReturnType<T["copilotInput"]>,
				"goldenSetEntity"
			>[];
		}
	: T extends true ? { entity: GoldenSetEntity }
	: never;

export interface IGoldenSetRepository extends IRepository<GoldenSetEntity> {
	getByFilters<T extends GoldenSetOptions>(
		filters: z.infer<typeof goldenSetFiltersSchema>,
		options: T,
	): Promise<Array<GoldenSetReturnType<T>>>;
}
