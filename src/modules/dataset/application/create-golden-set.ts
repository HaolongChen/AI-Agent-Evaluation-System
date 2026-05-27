import type z from "zod";
import type { IGoldenSetRepository } from "../domain/interface/golden-set.interface.ts";
import type { copilotTypeEnum } from "../domain/schema/golden-set.schema.ts";
import { GoldenSetEntity } from "../domain/entity/golden-set.entity.ts";

export class CreateGoldenSetUseCase {
  constructor(private repository: IGoldenSetRepository) {}

  async execute(schemaId: string) {
    const goldenSetEntity = new GoldenSetEntity({
      schemaId,
    });
    await this.repository.save(goldenSetEntity);
    return goldenSetEntity.getData();
  }
}
