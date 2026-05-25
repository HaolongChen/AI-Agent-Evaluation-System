import type { ExcludeOptions } from "../../../shared/domain/interface/repository.interface.ts";
import type { CriteriaEntity } from "../entity/rubric.entity.ts";
import type { RubricOptions, RubricReturnType } from "./rubric.interface.ts";

	name: "criteria";
	options: { rubric: ExcludeOptions<RubricOptions, "criteria"> | boolean };
}ptions: {rubric: ExcludeOptions<RubricOptions, "criteria"> | boolean;}
} ;

export type CriteriaReturnType<T> =
	T extends CriteriaOptions ?
		{
			entity: CriteriaEntity;
			rubric: ExcludeOptions<RubricReturnType<T["rubric"]>, "criteria">;
		}
	:	never;
