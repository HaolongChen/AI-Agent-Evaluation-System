import type z from "zod";
import type { IGoldenSetRepository } from "../domain/interface/golden-set.interface.ts";
import type { copilotTypeEnum } from "../domain/schema/golden-set.schema.ts";
import { GoldenSetEntity } from "../domain/entity/golden-set.entity.ts";

export class CreateGoldenSetUseCase {
  constructor(private readonly repository: IGoldenSetRepository) {}

  async execute(
    schemaId: string,
    copilotType?: z.infer<typeof copilotTypeEnum>,
    modelName?: string,
  ) {
    const goldenSetEntity = new GoldenSetEntity({
      schemaId,
      copilotType: copilotType ?? "dataModelBuilder",
      modelName: modelName ?? "undefined",
    });
    await this.repository.save(goldenSetEntity);
    return goldenSetEntity.toJSON();
  }
}
