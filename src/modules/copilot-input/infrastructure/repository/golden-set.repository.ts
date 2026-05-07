import type { output } from "zod";
import { GoldenSetEntity } from "../../domain/entity/golden-set.entity.js";
import type { IGoldenSetRepository } from "../../domain/interface/golden-set.interface.ts";
import type { goldenSetFiltersSchema } from "../../domain/schema/golden-set.schema.ts";
import { prisma } from "../../../../config/prisma.ts";

export class GoldenSetRepository implements IGoldenSetRepository {
  async getByUserInputId(userInputId: string): Promise<Array<GoldenSetEntity>> {
    const userInput = await prisma.userInput.findUnique({
      where: { id: userInputId },
      include: { goldenSets: true },
    });
    if (!userInput) {
      throw new Error(`UserInput with ID ${userInputId} not found`);
    }
    return userInput.goldenSets.map(
      (goldenSet) => new GoldenSetEntity(goldenSet, goldenSet.id),
    );
  }
  async getByFilters(
    filters: output<typeof goldenSetFiltersSchema>,
  ): Promise<Array<GoldenSetEntity>> {
    const goldenSets = await prisma.goldenSet.findMany({
      where: { ...filters },
    });
    return goldenSets.map(
      (goldenSet) => new GoldenSetEntity(goldenSet, goldenSet.id),
    );
  }
  async addUserInputAssociation(
    goldenSetId: string,
    userInputId: string,
  ): Promise<void> {
    await prisma.goldenSet.update({
      where: { id: goldenSetId },
      data: {
        userInputs: {
          connect: { id: userInputId },
        },
      },
    });
  }
  async save(entity: GoldenSetEntity): Promise<void> {
    await prisma.goldenSet.create({ data: { ...entity.data, id: entity.id } });
  }
  async findById(id: string): Promise<GoldenSetEntity> {
    const goldenSet = await prisma.goldenSet.findUnique({ where: { id } });
    if (!goldenSet) {
      throw new Error(`GoldenSet with ID ${id} not found`);
    }
    return new GoldenSetEntity(goldenSet, goldenSet.id);
  }
}
