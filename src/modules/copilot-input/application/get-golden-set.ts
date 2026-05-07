import type z from "zod";
import type { copilotTypeEnum } from "../domain/schema/golden-set.schema.ts";
import type { IGoldenSetRepository } from "../domain/interface/golden-set.interface.ts";

export class GetGoldenSetByIdUseCase {
  constructor(private readonly repository: IGoldenSetRepository) {}

  public async execute(goldenSetId: string) {
    const goldenSetEntity = await this.repository.findById(goldenSetId);
    return goldenSetEntity.toJSON();
  }
}

export class GetGoldenSetsByFilterUseCase {
  constructor(private readonly repository: IGoldenSetRepository) {}

  async execute(filter: {
    schemaId?: string;
    copilotType?: z.infer<typeof copilotTypeEnum>;
    modelName?: string;
  }) {
    const goldenSetEntities = await this.repository.getByFilters(filter);
    return goldenSetEntities.map((entity) => entity.toJSON());
  }
}

export class GetGoldenSetsByUserInputIdUseCase {
  constructor(private readonly repository: IGoldenSetRepository) {}

  async execute(userInputId: string) {
    const goldenSetEntities =
      await this.repository.getByUserInputId(userInputId);
    return goldenSetEntities.map((entity) => entity.toJSON());
  }
}
