import type z from "zod";
import type {
  IRepository,
} from "../../../shared/domain/interface/repository.interface.ts";
import type { GoldenSetEntity } from "../entity/golden-set.entity.ts";
import type { goldenSetFiltersSchema } from "../schema/golden-set.schema.ts";


export interface IGoldenSetRepository extends IRepository<GoldenSetEntity> {
  findById(id: string): Promise<GoldenSetEntity>;

  getByFilters(
    filters: z.infer<typeof goldenSetFiltersSchema>,
  ): Promise<Array<GoldenSetEntity>>;
}
