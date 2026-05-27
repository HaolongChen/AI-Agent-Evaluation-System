import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { GoldenSetEntity } from "../entity/golden-set.entity.ts";

export interface IGoldenSetRepository extends IRepository<GoldenSetEntity> {
  findById(id: string): Promise<GoldenSetEntity>;

  findBySchemaId(schemaId: string): Promise<GoldenSetEntity>;
}
