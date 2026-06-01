import { GoldenSetEntity } from "../../domain/entity/golden-set.entity.js";
import type { IGoldenSetRepository } from "../../domain/interface/golden-set.interface.ts";
import { prisma } from "../../../../config/prisma.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";

export type GoldenSetRepositoryType = {
  id: string;
  schemaId: string;
  updatedAt: Date;
};

export const goldenSetDataMapper = (
  goldenSet: GoldenSetRepositoryType,
  entity?: GoldenSetEntity,
): GoldenSetEntity => {
  return repositoryDateMapper(
    goldenSet,
    entity || new GoldenSetEntity(goldenSet, goldenSet.id),
  );
};

export class GoldenSetRepository implements IGoldenSetRepository {
  async findBySchemaId(schemaId: string): Promise<GoldenSetEntity> {
    const goldenSet = await prisma.goldenSet.findUnique({
      where: { schemaId },
    });
    if (!goldenSet) {
      throw new Error(`GoldenSet with Schema ID ${schemaId} not found`);
    }
    return goldenSetDataMapper(goldenSet);
  }
  async save(entity: GoldenSetEntity): Promise<void> {
    const goldenSet = await prisma.goldenSet.create({
      data: entity.getData(),
    });
    repositoryDateMapper(goldenSet, entity);
  }
  async findById(id: string): Promise<GoldenSetEntity> {
    const goldenSet = await prisma.goldenSet.findUnique({ where: { id } });
    if (!goldenSet) {
      throw new Error(`GoldenSet with ID ${id} not found`);
    }
    return goldenSetDataMapper(goldenSet);
  }
}
