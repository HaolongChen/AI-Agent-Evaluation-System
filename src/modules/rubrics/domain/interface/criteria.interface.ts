import type { ExcludeOptions } from "../../../shared/domain/interface/repository.interface.ts";
import type { CriteriaEntity } from "../entity/rubric.entity.ts";
import type { RubricOptions, RubricReturnType } from "./rubric.interface.ts";

export type CriteriaOptions = {
  name: "criteria";
  options: { rubric: ExcludeOptions<RubricOptions, "criteria"> | boolean };
};

export type CriteriaReturnType<T> = {
  entity: CriteriaEntity;
  rubric: T extends { options: { rubric: infer R } }
    ? RubricReturnType<R>
    : never;
};
